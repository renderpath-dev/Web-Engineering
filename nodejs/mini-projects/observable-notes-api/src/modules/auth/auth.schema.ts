import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(12).max(128)
});

export const loginSchema = registerSchema;
