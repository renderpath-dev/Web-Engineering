import type { Role } from "../../generated/prisma/client.js";

export type PublicUserDto = {
  id: string;
  email: string;
  role: Role;
};

export type AuthResult = {
  user: PublicUserDto;
  sessionToken: string;
  expiresAt: Date;
};
