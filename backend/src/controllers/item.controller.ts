import { Response } from "express";
import { prisma } from "../config/db.js";
import { uploadToCloudinary, cloudinary } from "../middlewares/upload.middleware.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { sendMatchAlert } from "../utils/email.service.js";
import { foundItemSchema, lostItemSchema, publicQuerySchema, idParamSchema } from "../validation/schemas.js";
import { validateImageMagicBytes } from "../validation/file.validation.js";

// 1. Report a Found Item (Requires Image & Location)
export const reportFoundItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validated = foundItemSchema.safeParse(req.body);
    if (!validated.success) {
      res.status(400).json({ error: "Validation failed", details: validated.error.format() });
      return;
    }
    const { title, description, category, latitude, longitude } = validated.data;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized access." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Photographic evidence is mandatory for found items." });
      return;
    }

    // --- FILE SECURITY VALIDATION ---
    // Reject invalid/corrupted files based on actual magic bytes
    const detectedMime = validateImageMagicBytes(req.file.buffer);
    if (!detectedMime) {
      res.status(400).json({ error: "Invalid image file" });
      return;
    }

    // Stream image buffer to Cloudinary
    const cloudResponse = await uploadToCloudinary(req.file.buffer);

    const item = await prisma.item.create({
      data: {
        type: "FOUND",
        title,
        description,
        category,
        latitude,
        longitude,
        imageUrl: cloudResponse.secure_url,
        imageId: cloudResponse.public_id,
        reporterId: userId,
      },
    });

    // --- AUTOMATED EMAIL MATCHING SYSTEM ---
    // 1. Find all active "Lost" items in the same category
    const potentialMatches = await prisma.item.findMany({
      where: {
        type: "LOST",
        category: category,
        status: "ACTIVE",
      },
      include: {
        reporter: { select: { email: true } }
      }
    });

    // 2. Extract unique emails (Explicitly typed as 'any' to satisfy strict TS)
    const uniqueEmails = [...new Set(potentialMatches.map((match: any) => match.reporter.email))];

    // 3. Send email alerts silently in the background
    uniqueEmails.forEach((email: any) => {
      if (email) sendMatchAlert(String(email), title, category);
    });
    // ---------------------------------------

    res.status(201).json({ message: "Found item reported successfully", item });
  } catch (error: any) {
    console.error("Found Item Error:", error.message || "Unknown error");
    res.status(500).json({ error: "Failed to report found item." });
  }
};

// 2. Report a Lost Item (Image is Optional)
export const reportLostItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validated = lostItemSchema.safeParse(req.body);
    if (!validated.success) {
      res.status(400).json({ error: "Validation failed", details: validated.error.format() });
      return;
    }
    const { title, description, category } = validated.data;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized access." });
      return;
    }

    let imageUrl = null;
    let imageId = null;

    if (req.file) {
      // --- FILE SECURITY VALIDATION ---
      const detectedMime = validateImageMagicBytes(req.file.buffer);
      if (!detectedMime) {
        res.status(400).json({ error: "Invalid image file" });
        return;
      }

      const cloudResponse = await uploadToCloudinary(req.file.buffer);
      imageUrl = cloudResponse.secure_url;
      imageId = cloudResponse.public_id;
    }

    const item = await prisma.item.create({
      data: {
        type: "LOST",
        title,
        description,
        category,
        imageUrl,
        imageId,
        reporterId: userId,
      },
    });

    res.status(201).json({ message: "Lost item reported successfully", item });
  } catch (error: any) {
    console.error("Lost Item Error:", error.message || "Unknown error");
    res.status(500).json({ error: "Failed to report lost item." });
  }
};

// 3. Fetch All Active Items (With Search, Filter, & Pagination)
export const getActiveItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validated = publicQuerySchema.safeParse(req.query);
    if (!validated.success) {
      res.status(400).json({ error: "Validation failed", details: validated.error.format() });
      return;
    }
    const { search, type, page, limit } = validated.data;

    // Calculate how many items to skip based on the current page
    const skip = (page - 1) * limit;

    // Base query: Only show active items
    const whereClause: any = { status: "ACTIVE" };

    if (type && type !== "ALL") {
      whereClause.type = type;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
        { category: { contains: String(search), mode: "insensitive" } }
      ];
    }

    // Fetch the specific chunk of items
    const items = await prisma.item.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: skip,
      take: limit,
      include: {
        reporter: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    // Count total items so the frontend knows if a "Load More" button is needed
    const totalItems = await prisma.item.count({ where: whereClause });
    const hasMore = skip + items.length < totalItems;

    // Return the items array alongside the hasMore boolean
    res.status(200).json({ items, hasMore });
  } catch (error: any) {
    console.error("Fetch Items Error:", error.message || "Unknown error");
    res.status(500).json({ error: "Failed to fetch items." });
  }
};

// 4. Admin: Fetch ALL items with full user details
export const getAllItemsAdmin = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: { name: true, email: true }, // Admins need to see emails to contact users
        },
      },
    });
    res.status(200).json(items);
  } catch (error: any) {
    console.error("Admin Fetch Error:", error.message || "Unknown error");
    res.status(500).json({ error: "Failed to fetch admin data." });
  }
};

// 5. Admin: Permanently Delete an Item
export const deleteItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validated = idParamSchema.safeParse(req.params);
    if (!validated.success) {
      res.status(400).json({ error: "Validation failed", details: validated.error.format() });
      return;
    }
    const { id } = validated.data;
    const adminId = req.user?.id;

    if (!adminId) {
      res.status(401).json({ error: "Unauthorized access." });
      return;
    }

    // Retrieve target item to verify it exists and gather metadata for auditing
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: "Item not found." });
      return;
    }

    // Execute atomic deletion and audit logging in a single database transaction
    await prisma.$transaction([
      prisma.item.delete({ where: { id } }),
      prisma.auditLog.create({
        data: {
          action: "DELETE_ITEM",
          adminId: adminId,
          details: JSON.stringify({
            itemId: item.id,
            type: item.type,
            category: item.category
          })
        }
      })
    ]);

    // External Side-Effect: Erase the photo from the cloud AFTER successful DB transaction
    if (item.imageId) {
      try {
        await cloudinary.uploader.destroy(item.imageId);
      } catch (cloudErr: any) {
        console.error(`Cloudinary deletion failed for imageId ${item.imageId}:`, cloudErr.message || "Unknown error");
        // Do not fail the response here; the database transaction is fully committed.
      }
    }

    res.status(200).json({ message: "Item permanently deleted." });
  } catch (error: any) {
    console.error("Admin Delete Error:", error.message || "Unknown error");
    res.status(500).json({ error: "Failed to delete item." });
  }
};
