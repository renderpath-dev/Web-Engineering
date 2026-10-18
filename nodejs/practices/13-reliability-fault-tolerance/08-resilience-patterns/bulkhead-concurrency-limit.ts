export class PracticeBulkhead {
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(
    private readonly maxConcurrency: number,
    private readonly maxQueue: number
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrency) {
      if (this.queue.length >= this.maxQueue) {
        throw new Error("Bulkhead rejected operation");
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

  snapshot(): { active: number; queued: number; maxConcurrency: number; maxQueue: number } {
    return {
      active: this.active,
      queued: this.queue.length,
      maxConcurrency: this.maxConcurrency,
      maxQueue: this.maxQueue
    };
  }
}
