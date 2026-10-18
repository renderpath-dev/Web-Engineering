import { Router } from "express";
import { authenticateSession, getCsrfToken, getCurrentUser, login, logout, register, requireCsrfToken } from "./auth.controller.js";
import { authBodySchema } from "./auth.schema.js";
import { validateRequest } from "../../shared/validation/validate-request.js";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest({ body: authBodySchema }), register);
authRoutes.post("/login", validateRequest({ body: authBodySchema }), login);
authRoutes.post("/logout", authenticateSession, requireCsrfToken, logout);
authRoutes.get("/me", authenticateSession, getCurrentUser);
authRoutes.get("/csrf", authenticateSession, getCsrfToken);
