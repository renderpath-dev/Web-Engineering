import cors from "cors";
import { config } from "../../config/env.js";

const allowedOrigins = new Set(config.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean));

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true
});
