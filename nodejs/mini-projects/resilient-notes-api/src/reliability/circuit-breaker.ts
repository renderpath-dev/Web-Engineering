import { circuitBreakerOpenTotal, circuitBreakerState } from "../observability/reliability-metrics.js";

export type CircuitBreakerState = "closed" | "open" | "half-open";

export class CircuitBreakerOpenError extends Error {
  readonly status = 503;

  constructor() {
    super("Circuit breaker is open");
    this.name = "CircuitBreakerOpenError";
  }
}

export interface CircuitBreakerOptions {
  dependency: string;
  failureThreshold: number;
  recoveryTimeoutMs: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = "closed";
  private failures = 0;
  private openedAt = 0;

  constructor(private readonly options: CircuitBreakerOptions) {
    this.publishState();
  }

  getState(): CircuitBreakerState {
    if (this.state === "open" && Date.now() - this.openedAt >= this.options.recoveryTimeoutMs) {
      this.state = "half-open";
      this.publishState();
    }
    return this.state;
  }

  reset(): void {
    this.state = "closed";
    this.failures = 0;
    this.openedAt = 0;
    this.publishState();
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const currentState = this.getState();
    if (currentState === "open") {
      throw new CircuitBreakerOpenError();
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess(): void {
    this.failures = 0;
    this.state = "closed";
    this.publishState();
  }

  private recordFailure(): void {
    this.failures += 1;
    if (this.state === "half-open" || this.failures >= this.options.failureThreshold) {
      this.state = "open";
      this.openedAt = Date.now();
      circuitBreakerOpenTotal.inc({ dependency: this.options.dependency });
    }
    this.publishState();
  }

  private publishState(): void {
    for (const state of ["closed", "open", "half-open"] as const) {
      circuitBreakerState.set({ dependency: this.options.dependency, state }, this.state === state ? 1 : 0);
    }
  }
}
