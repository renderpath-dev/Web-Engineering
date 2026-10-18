import { Router } from "express";
import { authenticateSession } from "../../shared/auth/authenticate-session.js";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { authController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest({ body: registerSchema }), authController.register);
authRoutes.post("/login", validateRequest({ body: loginSchema }), authController.login);
authRoutes.post("/logout", authenticateSession, requireCsrfToken, authController.logout);
authRoutes.get("/me", authenticateSession, authController.me);
authRoutes.get("/csrf", authenticateSession, authController.csrf);
