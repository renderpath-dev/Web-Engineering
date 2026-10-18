import { randomUUID } from "node:crypto";
import { config } from "../../config/env.js";
import { abortableDelay } from "../../reliability/abortable.js";
import { Bulkhead } from "../../reliability/bulkhead.js";
import { CircuitBreaker } from "../../reliability/circuit-breaker.js";
import { executeIdempotentOperation } from "../../reliability/idempotency-store.js";
import { buildRequestFingerprint, validateIdempotencyKey } from "../../reliability/idempotency-key.js";
import { executeWithRetry } from "../../reliability/retry-executor.js";
import { type RetryPolicy } from "../../reliability/retry-policy.js";
import { TimeoutError, withTimeout } from "../../reliability/timeout.js";
import { getJsonWithFallback } from "../../redis/redis-cache.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { getFaultScenario, resetFaultScenario, setFaultScenario, type FaultScenario } from "../../reliability/fault-injection.js";

const dependencyBreaker = new CircuitBreaker({
  dependency: "demo_dependency",
  failureThreshold: 2,
  recoveryTimeoutMs: 250
});

const dependencyBulkhead = new Bulkhead("demo_dependency", config.BULKHEAD_CONCURRENCY, config.BULKHEAD_QUEUE);

export const reliabilityService = {
  async timeoutDemo() {
    return withTimeout(async (signal) => {
      await abortableDelay(config.DEPENDENCY_TIMEOUT_MS + 50, signal, "timeout_demo");
      return { ok: true, mechanism: "timeout", detail: "completed within timeout" };
    }, config.DEPENDENCY_TIMEOUT_MS, "timeout_demo");
  },

  async abortDemo() {
    const controller = new AbortController();
    controller.abort(new Error("caller cancelled operation"));
    try {
      await abortableDelay(100, controller.signal, "abort_demo");
    } catch (error) {
      if (error instanceof Error) {
        return { ok: true, mechanism: "abort", detail: error.message };
      }
    }
    return { ok: false, mechanism: "abort", detail: "abort was not observed" };
  },

  async retryDemo() {
    let attempts = 0;
    const policy: RetryPolicy = {
      operation: "retry_demo",
      maxAttempts: 3,
      baseDelayMs: 10,
      maxDelayMs: 50,
      retryBudget: 2
    };

    const result = await executeWithRetry(async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new TimeoutError("temporary demo failure");
      }
      return { ok: true, mechanism: "retry", detail: `succeeded after ${attempts} attempts` };
    }, policy);

    return result;
  },

  async circuitBreakerDemo() {
    return {
      ok: true,
      mechanism: "circuit_breaker",
      detail: dependencyBreaker.getState()
    };
  },

  async bulkheadDemo() {
    const started = [
      dependencyBulkhead.execute(async () => {
        await abortableDelay(25);
        return "first";
      }),
      dependencyBulkhead.execute(async () => "second")
    ];
    const results = await Promise.allSettled(started);
    return {
      ok: true,
      mechanism: "bulkhead",
      detail: JSON.stringify({ results: results.map((result) => result.status), snapshot: dependencyBulkhead.snapshot() })
    };
  },

  async degradedCacheDemo() {
    const result = await getJsonWithFallback("reliability:demo", 30, async () => ({
      generatedAt: new Date().toISOString(),
      source: "origin"
    }));
    return {
      ok: true,
      mechanism: "cache_fallback",
      detail: JSON.stringify({ source: result.source, degraded: result.degraded })
    };
  },

  async idempotentOperation(method: string, path: string, idempotencyKey: string | undefined, body: unknown) {
    const key = validateIdempotencyKey(idempotencyKey);
    const fingerprint = buildRequestFingerprint(method, path, body);
    return executeIdempotentOperation(key, fingerprint, async () => ({
      statusCode: 201,
      body: {
        operationId: randomUUID(),
        accepted: true,
        input: body
      }
    }));
  },

  applyFaultScenario(scenario: FaultScenario) {
    if (scenario === "none") {
      resetFaultScenario();
      dependencyBreaker.reset();
      return { ok: true, mechanism: "fault_injection", detail: "reset" };
    }

    const active = setFaultScenario(scenario);
    if (active === "circuit_open") {
      void dependencyBreaker.execute(async () => {
        throw new Error("forced breaker failure");
      }).catch(() => undefined);
      void dependencyBreaker.execute(async () => {
        throw new Error("forced breaker failure");
      }).catch(() => undefined);
    }
    return { ok: true, mechanism: "fault_injection", detail: getFaultScenario() };
  },

  async assertNoUnsafeFaultCrash() {
    if (getFaultScenario() === "timeout") throw new TimeoutError("Injected timeout");
    if (getFaultScenario() === "db_conflict") throw new HttpError(409, "Injected database conflict", "CONFLICT");
    if (getFaultScenario() === "redis_outage") {
      return { ok: true, mechanism: "fault_injection", detail: "simulated redis outage handled as optional fallback" };
    }
    return { ok: true, mechanism: "fault_injection", detail: "no active fault" };
  }
};
