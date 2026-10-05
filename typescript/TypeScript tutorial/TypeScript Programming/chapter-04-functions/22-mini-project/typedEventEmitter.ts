// Goal:
// Build a small typed event emitter with generic event payloads.

// Expected result:
// The compiler enforces event names and payload types.

export {};

type EventMap = {
  productCreated: {
    id: string;
    title: string;
  };
  inventoryChanged: {
    id: string;
    stockCount: number;
  };
};

type EventHandler<PayloadType> = (payload: PayloadType) => void;

function createEventEmitter<Events extends Record<string, unknown>>() {
  const handlers: {
    [EventName in keyof Events]?: EventHandler<Events[EventName]>[];
  } = {};

  return {
    on<EventName extends keyof Events>(
      eventName: EventName,
      handler: EventHandler<Events[EventName]>,
    ): void {
      const eventHandlers = handlers[eventName] ?? [];
      eventHandlers.push(handler);
      handlers[eventName] = eventHandlers;
    },

    emit<EventName extends keyof Events>(
      eventName: EventName,
      payload: Events[EventName],
    ): void {
      const eventHandlers = handlers[eventName] ?? [];

      for (const handler of eventHandlers) {
        handler(payload);
      }
    },
  };
}

const eventEmitter = createEventEmitter<EventMap>();

eventEmitter.on("productCreated", (payload) => {
  console.log(payload.title);
});

eventEmitter.emit("productCreated", {
  id: "p1",
  title: "Keyboard",
});

// @ts-expect-error: The payload shape does not match inventoryChanged.
eventEmitter.emit("inventoryChanged", { id: "p1", title: "Keyboard" });