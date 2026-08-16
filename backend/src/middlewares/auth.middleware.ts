import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "USER" | "ADMIN";
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required." });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, decoded) => {
    if (err) {
      res.status(403).json({ error: "Token is invalid or expired." });
      return;
    }
    req.user = decoded as AuthenticatedRequest["user"];
    next();
  });
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ error: "Access restricted: Administrator role required." });
    return;
  }
  next();
};