import { z } from "zod";

// --- REUSABLE ENUMS & FORMATS ---
export const CategoryEnum = z.enum(["Electronics", "Documents", "Keys", "Clothing", "Other"]);
export const ItemTypeEnum = z.enum(["LOST", "FOUND", "ALL"]);

// --- SCHEMAS ---

export const googleLoginSchema = z.object({
  token: z.string().trim().min(1, "Google token is required."),
}).strict();

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid item ID format."),
});

export const lostItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(100, "Title is too long."),
  description: z.string().trim().min(1, "Description is required.").max(1000, "Description is too long."),
  category: CategoryEnum,
}); // Note: We do not use .strict() because Multer may add fields or there might be unrelated form fields, but we only extract what we need. 
// Wait, the prompt says "Use an intentional Zod policy for unknown fields. Unknown JSON/body fields should not silently become part of the application's business data."
// `.strip()` is the default behavior in Zod. It removes unknown fields. Let's rely on default strip behavior.

export const foundItemSchema = lostItemSchema.extend({
  latitude: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? NaN : v), z.coerce.number().min(-90, "Latitude must be >= -90").max(90, "Latitude must be <= 90")),
  longitude: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? NaN : v), z.coerce.number().min(-180, "Longitude must be >= -180").max(180, "Longitude must be <= 180")),
});

export const publicQuerySchema = z.object({
  search: z.string().max(100, "Search query is too long.").optional(),
  type: ItemTypeEnum.optional(),
  page: z.coerce.number().int().min(1, "Page must be >= 1").optional().default(1),
  limit: z.coerce.number().int().min(1, "Limit must be >= 1").max(100, "Limit cannot exceed 100").optional().default(9),
});
