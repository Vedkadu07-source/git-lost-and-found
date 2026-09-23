import cron from "node-cron";
import { prisma } from "./config/db.js";
import { cloudinary } from "./middlewares/upload.middleware.js";

// Run every night at exactly 00:00 (Midnight)
export const startCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("🧹 Running nightly 90-day retention sweep...");

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    try {
      // 1. Find all expired ACTIVE items
      const expiredItems = await prisma.item.findMany({
        where: {
          status: "ACTIVE",
          createdAt: {
            lt: ninetyDaysAgo,
          },
        },
      });

      if (expiredItems.length === 0) {
        console.log("✅ No expired items found for deletion.");
        return;
      }

      const itemsToDelete: string[] = [];

      // 2. Process Cloudinary deletions per item
      for (const item of expiredItems) {
        try {
          if (item.imageId) {
            await cloudinary.uploader.destroy(item.imageId);
          }
          // If image deletion succeeded, or there was no image, queue for DB deletion
          itemsToDelete.push(item.id);
        } catch (error: any) {
          console.error(`⚠️ Failed to delete image for item ${item.id}: ${error.message || "Unknown error"}`);
        }
      }

      if (itemsToDelete.length === 0) {
        console.log("⚠️ All image deletions failed. No items were deleted from the database.");
        return;
      }

      // 3. Delete successfully processed records from the PostgreSQL database
      const deleted = await prisma.item.deleteMany({
        where: {
          id: { in: itemsToDelete },
        },
      });

      console.log(`🗑️ Successfully purged ${deleted.count} expired ACTIVE items from the system.`);
    } catch (error: any) {
      console.error("❌ Nightly cron job failed:", error.message || "Unknown error");
    }
  });
};