export interface PublicUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface AuthSessionResult {
  user: PublicUser;
  sessionToken: string;
  csrfToken: string;
  expiresAt: Date;
}

export interface SessionRequestMeta {
  userAgent?: string;
  ip?: string;
}
