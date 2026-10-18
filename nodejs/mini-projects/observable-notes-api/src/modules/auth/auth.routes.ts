import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { authenticateSession } from "../../shared/auth/authenticate-session.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { csrfController, loginController, logoutController, meController, registerController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest({ body: registerSchema }), registerController);
authRoutes.post("/login", validateRequest({ body: loginSchema }), loginController);
authRoutes.post("/logout", authenticateSession, requireCsrfToken, logoutController);
authRoutes.get("/me", authenticateSession, meController);
authRoutes.get("/csrf", authenticateSession, csrfController);
