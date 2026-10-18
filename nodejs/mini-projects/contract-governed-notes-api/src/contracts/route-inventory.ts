import type { Request } from "express";
import type { OperationId } from "./operation-id.js";

export type RouteInventoryItem = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  operationId: OperationId;
  protected: boolean;
  deprecated: boolean;
};

export const routeInventory: RouteInventoryItem[] = [
  { method: "GET", path: "/v1/health/live", operationId: "getLiveHealth", protected: false, deprecated: false },
  { method: "GET", path: "/v1/health/ready", operationId: "getReadyHealth", protected: false, deprecated: false },
  { method: "GET", path: "/v1/metrics", operationId: "getMetrics", protected: false, deprecated: false },
  { method: "POST", path: "/v1/auth/register", operationId: "registerUser", protected: false, deprecated: false },
  { method: "POST", path: "/v1/auth/login", operationId: "loginUser", protected: false, deprecated: false },
  { method: "POST", path: "/v1/auth/logout", operationId: "logoutUser", protected: true, deprecated: false },
  { method: "GET", path: "/v1/auth/me", operationId: "getCurrentUser", protected: true, deprecated: false },
  { method: "GET", path: "/v1/auth/csrf", operationId: "getCsrfToken", protected: true, deprecated: false },
  { method: "GET", path: "/v1/notebooks", operationId: "listNotebooks", protected: true, deprecated: false },
  { method: "POST", path: "/v1/notebooks", operationId: "createNotebook", protected: true, deprecated: false },
  { method: "GET", path: "/v1/notebooks/:notebookId", operationId: "getNotebookById", protected: true, deprecated: false },
  { method: "PATCH", path: "/v1/notebooks/:notebookId", operationId: "updateNotebookById", protected: true, deprecated: false },
  { method: "DELETE", path: "/v1/notebooks/:notebookId", operationId: "deleteNotebookById", protected: true, deprecated: false },
  { method: "GET", path: "/v1/notebooks/:notebookId/notes", operationId: "listNotebookNotes", protected: true, deprecated: false },
  { method: "POST", path: "/v1/notebooks/:notebookId/notes", operationId: "createNotebookNote", protected: true, deprecated: false },
  { method: "GET", path: "/v1/notes/:noteId", operationId: "getNoteById", protected: true, deprecated: false },
  { method: "PATCH", path: "/v1/notes/:noteId", operationId: "updateNoteById", protected: true, deprecated: false },
  { method: "DELETE", path: "/v1/notes/:noteId", operationId: "deleteNoteById", protected: true, deprecated: false },
  { method: "GET", path: "/v1/contracts/openapi.yaml", operationId: "getOpenApiYaml", protected: false, deprecated: false },
  { method: "GET", path: "/v1/contracts/route-inventory", operationId: "getRouteInventory", protected: false, deprecated: false },
  { method: "GET", path: "/v1/contracts/compatibility-report", operationId: "getCompatibilityReport", protected: false, deprecated: false },
  { method: "GET", path: "/v1/version", operationId: "getVersion", protected: false, deprecated: false },
  { method: "GET", path: "/v1/deprecated-demo", operationId: "getDeprecatedDemo", protected: false, deprecated: true }
];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function scrubPattern(path: string): string {
  const [pathname] = path.split("?");
  return pathname
    .split("/")
    .map((segment) => (uuidPattern.test(segment) ? ":id" : segment))
    .join("/")
    .replace(/\/$/, "") || "/";
}

export function getRoutePattern(request: Request): string {
  const routePath = typeof request.route?.path === "string" ? request.route.path : "";
  const pattern = `${request.baseUrl}${routePath}`.replace(/\/$/, "");
  return pattern || scrubPattern(request.path);
}

export function routeKey(route: Pick<RouteInventoryItem, "method" | "path">): string {
  return `${route.method.toUpperCase()} ${route.path}`;
}
