import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { env } from "../config/env.js";

// 1. Authenticate with Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// 2. Configure Multer to store files temporarily in RAM (Memory Storage)
const storage = multer.memoryStorage();
export const uploadImage = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit to prevent server overload
});

// 3. Create a helper function to stream the RAM buffer directly to Cloudinary
export const uploadToCloudinary = (fileBuffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "git-lost-found",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 800, height: 800, crop: "limit" }],
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(fileBuffer);
  });
};

export { cloudinary };