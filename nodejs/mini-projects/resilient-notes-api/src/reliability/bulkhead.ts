import { bulkheadRejectedTotal } from "../observability/reliability-metrics.js";

export class BulkheadRejectedError extends Error {
  readonly status = 503;

  constructor() {
    super("Bulkhead capacity exceeded");
    this.name = "BulkheadRejectedError";
  }
}

export class Bulkhead {
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(
    private readonly dependency: string,
    private readonly concurrencyLimit: number,
    private readonly queueLimit: number
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.active >= this.concurrencyLimit) {
      if (this.queue.length >= this.queueLimit) {
        bulkheadRejectedTotal.inc({ dependency: this.dependency });
        throw new BulkheadRejectedError();
      }
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.active += 1;
    try {
      return await operation();
    } finally {
      this.active -= 1;
      const next = this.queue.shift();
      if (next) next();
    }
  }

  snapshot(): { active: number; queued: number; concurrencyLimit: number; queueLimit: number } {
    return {
      active: this.active,
      queued: this.queue.length,
      concurrencyLimit: this.concurrencyLimit,
      queueLimit: this.queueLimit
    };
  }

  close(): void {
    this.queue.splice(0).forEach((next) => next());
  }
}
