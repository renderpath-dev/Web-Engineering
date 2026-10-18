import type { Request } from "express";
import { z } from "zod";

export const authBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

export const csrfHeaderSchema = z.object({
  "x-csrf-token": z.string().min(16)
});

export type AuthContext = {
  userId: string;
  email: string;
  sessionId: string;
  csrfTokenHash: string;
};

export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};
