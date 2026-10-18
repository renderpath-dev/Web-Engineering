import type { Request } from "express";
import { HttpError } from "../errors/http-error.js";

export interface AuthContext {
  userId: string;
  sessionId: string;
  role: "USER" | "ADMIN";
  csrfTokenHash?: string | null;
}

export interface AuthenticatedRequest extends Request {
  auth: AuthContext;
}

export function setAuthContext(request: Request, auth: AuthContext): void {
  (request as AuthenticatedRequest).auth = auth;
}

export function getAuthContext(request: Request): AuthContext {
  const auth = (request as Partial<AuthenticatedRequest>).auth;
  if (!auth) throw new HttpError(401, "UNAUTHENTICATED", "Authentication is required.");
  return auth;
}
