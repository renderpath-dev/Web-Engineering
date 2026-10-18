export interface AuthUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthSessionResult {
  user: AuthUser;
  sessionToken: string;
  csrfToken: string;
  expiresAt: Date;
}
