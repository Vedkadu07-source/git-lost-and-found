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
      // 1. Find all expired items
      const expiredItems = await prisma.item.findMany({
        where: {
          createdAt: {
            lt: ninetyDaysAgo,
          },
        },
      });

      if (expiredItems.length === 0) {
        console.log("✅ No expired items found for deletion.");
        return;
      }

      // 2. Delete images from Cloudinary storage
      for (const item of expiredItems) {
        if (item.imageId) {
          await cloudinary.uploader.destroy(item.imageId);
        }
      }

      // 3. Delete records from the PostgreSQL database
      const deleted = await prisma.item.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo },
        },
      });

      console.log(`🗑️ Successfully purged ${deleted.count} expired items from the system.`);
    } catch (error) {
      console.error("❌ Nightly cron job failed:", error);
    }
  });
};