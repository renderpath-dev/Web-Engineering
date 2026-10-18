import { HttpError } from "../errors/http-error.js";

export function requireOwner(resourceOwnerId: string, authenticatedUserId: string): void {
  if (resourceOwnerId !== authenticatedUserId) {
    throw new HttpError(403, "The resource does not belong to the authenticated user.", "OWNER_REQUIRED");
  }
}
