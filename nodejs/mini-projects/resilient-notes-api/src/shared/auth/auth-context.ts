import type { Request } from "express";

export interface AuthContext {
  userId: string;
  sessionId: string;
  role: "USER" | "ADMIN";
}

export type AuthenticatedRequest = Request & {
  auth: AuthContext;
};

export function requireAuthContext(request: Request): AuthContext {
  const auth = (request as Request & { auth?: AuthContext }).auth;
  if (!auth) throw new Error("Authentication context is missing");
  return auth;
}
