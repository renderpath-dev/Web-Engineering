import cors from "cors";
import { config } from "../../config/env.js";

export const corsMiddleware = cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || config.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin is not allowed."));
  },
  allowedHeaders: ["content-type", "x-csrf-token", "last-event-id"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
});
