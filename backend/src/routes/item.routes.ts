import { Router } from "express";
import { reportFoundItem, reportLostItem, getActiveItems, getAllItemsAdmin, deleteItem } from "../controllers/item.controller.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.middleware.js";
import { uploadImage } from "../middlewares/upload.middleware.js";
const router = Router();

// Publicly visible feed
router.get("/", getActiveItems);

// Protected submission routes (Requires valid JWT)
// Using multer's .single('image') to intercept the file upload
router.post("/found", authenticateToken, uploadImage.single("image"), reportFoundItem);
router.post("/lost", authenticateToken, uploadImage.single("image"), reportLostItem);

// Admin-Only Routes
router.get("/admin/all", authenticateToken, requireAdmin, getAllItemsAdmin);
router.delete("/:id", authenticateToken, requireAdmin, deleteItem);

export default router;