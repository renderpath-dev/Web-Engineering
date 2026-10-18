import type { Role } from "../../generated/prisma/client.js";

export type UserRecord = {
  id: string;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};
