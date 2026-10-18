import type { RequestHandler } from "express";
import { buildCompatibilityReport } from "../../contracts/compatibility-report.js";
import { readOpenApiYaml } from "../../contracts/openapi-loader.js";
import { routeInventory } from "../../contracts/route-inventory.js";
import { sendJson } from "../../shared/responses/send-response.js";

export const getOpenApiYaml: RequestHandler = async (_request, response, next) => {
  try {
    response.type("application/yaml").send(await readOpenApiYaml());
  } catch (error) {
    next(error);
  }
};

export const getRouteInventory: RequestHandler = (_request, response) => {
  sendJson(response, 200, { items: routeInventory });
};

export const getCompatibilityReport: RequestHandler = (_request, response) => {
  sendJson(response, 200, buildCompatibilityReport());
};
