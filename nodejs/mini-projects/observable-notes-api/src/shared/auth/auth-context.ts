import type { Response } from "express";
import type { Role } from "../../generated/prisma/client.js";

export type AuthContext = {
  userId: string;
  email: string;
  role: Role;
  sessionId: string;
};

export function attachAuthContext(response: Response, context: AuthContext): void {
  response.locals.auth = context;
}

export function requireAuthContext(response: Response): AuthContext {
  const context = response.locals.auth as AuthContext | undefined;
  if (!context) {
    throw new Error("Auth context is missing.");
  }

  return context;
}
