import { HttpError } from "../errors/http-error.js";
import type { AuthContext } from "./auth-context.js";

export function requireOwner(auth: AuthContext, ownerId: string): void {
  if (auth.role === "ADMIN") return;
  if (auth.userId !== ownerId) {
    throw new HttpError(403, "FORBIDDEN", "The authenticated user does not own this resource.");
  }
}
