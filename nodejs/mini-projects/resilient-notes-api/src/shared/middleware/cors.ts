import cors from "cors";
import { config } from "../../config/env.js";

const allowedOrigins = config.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());

export const corsMiddleware = cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("CORS origin is not allowed"));
  }
});
