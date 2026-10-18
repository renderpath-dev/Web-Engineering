import { runWithSpan } from "./tracing.js";

type ServiceOperation = "notebooks.list" | "notebooks.write" | "notes.list" | "notes.write";
type DependencyName = "postgres" | "redis";

export function withServiceSpan<T>(operation: ServiceOperation, callback: () => Promise<T>): Promise<T> {
  return runWithSpan(`service.${operation}`, { "app.operation": operation }, callback);
}

export function withDependencySpan<T>(dependency: DependencyName, operation: string, callback: () => Promise<T>): Promise<T> {
  return runWithSpan(`dependency.${dependency}.${operation}`, {
    "dependency.system": dependency,
    "dependency.operation": operation
  }, callback);
}
