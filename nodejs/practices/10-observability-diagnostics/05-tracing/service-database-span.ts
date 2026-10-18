type SpanEvent = { name: string; attributes: Record<string, string> };

const events: SpanEvent[] = [];

async function withDatabaseSpan<T>(
    operationName: string,
    operation: () => Promise<T>
): Promise<T> {
  events.push({ name: "span.start", attributes: { operationName } });

  try {
    return await operation();
  } finally {
    events.push({ name: "span.end", attributes: { operationName } });
  }
}

async function main(): Promise<void> {
  await withDatabaseSpan("notes.repository.findMany", async () => [
    { title: "First note" }
  ]);

  console.log(events);
}

void main();