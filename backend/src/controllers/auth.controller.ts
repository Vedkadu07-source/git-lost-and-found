import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ALLOWED_DOMAIN = "git-india.edu.in";

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: "Google token is required." });
      return;
    }

    // Verify token integrity with Google's public keys
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(401).json({ error: "Invalid Google payload." });
      return;
    }

    const { email, name, picture } = payload;

    // Strict Domain Check
    const emailDomain = email.split("@")[1];
    if (emailDomain !== ALLOWED_DOMAIN) {
      res.status(403).json({
        error: `Access Denied: Only @${ALLOWED_DOMAIN} accounts are authorized.`,
      });
      return;
    }

    // Check or upsert user into PostgreSQL
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && user.isRevoked) {
      res.status(403).json({ error: "Your account access has been revoked by an Administrator." });
      return;
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || "GIT Member",
          avatarUrl: picture || null,
          role: "USER",
        },
      });
    }

    // Sign a session JWT
    const appToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Authentication successful",
      token: appToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ error: "Authentication failed. Please try again." });
  }
};