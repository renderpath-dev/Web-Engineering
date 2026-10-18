import { Router } from "express";
import { getDeprecatedDemo, getVersion } from "./versioning.controller.js";

export const versioningRoutes = Router();

versioningRoutes.get("/version", getVersion);
versioningRoutes.get("/deprecated-demo", getDeprecatedDemo);
