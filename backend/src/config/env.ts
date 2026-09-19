import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().optional().default("5000"),
  FRONTEND_URL: z.string().url().optional().default("http://localhost:5173"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required and cannot be empty"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),
  TRUST_PROXY: z.string().optional().transform(val => val === "true" || val === "1").default(false),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables. The application will safely exit.");
  // Do not log the actual invalid values for security
  // But log the keys that failed validation
  const failedKeys = Object.keys(_env.error.format()).filter(key => key !== "_errors");
  console.error(`Invalid or missing variables: ${failedKeys.join(", ")}`);
  process.exit(1);
}

export const env = _env.data;
