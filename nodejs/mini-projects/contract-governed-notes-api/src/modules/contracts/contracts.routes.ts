import { Router } from "express";
import { getCompatibilityReport, getOpenApiYaml, getRouteInventory } from "./contracts.controller.js";

export const contractsRoutes = Router();

contractsRoutes.get("/openapi.yaml", getOpenApiYaml);
contractsRoutes.get("/route-inventory", getRouteInventory);
contractsRoutes.get("/compatibility-report", getCompatibilityReport);
