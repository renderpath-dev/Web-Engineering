import { Router } from "express";
import * as controller from "./health.controller.js";

export const healthRoutes = Router();

healthRoutes.get("/live", controller.live);
healthRoutes.get("/ready", controller.ready);
