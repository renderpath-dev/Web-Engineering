import type { StoredRealtimeEvent } from "../realtime/events.js";
import { formatStoredRealtimeEvent, formatSseEvent } from "./sse-format.js";
import type { SseConnection } from "./sse-connection.js";

export class SseRegistry {
  private readonly connections = new Map<string, SseConnection>();

  add(connection: SseConnection): void {
    this.connections.set(connection.connectionId, connection);
  }

  remove(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  sendToUser(userId: string, event: StoredRealtimeEvent): void {
    for (const connection of this.connections.values()) {
      if (connection.userId === userId && !connection.noteId) {
        connection.response.write(formatStoredRealtimeEvent(event));
      }
    }
  }

  sendToNote(noteId: string, event: StoredRealtimeEvent): void {
    for (const connection of this.connections.values()) {
      if (connection.noteId === noteId) {
        connection.response.write(formatStoredRealtimeEvent(event));
      }
    }
  }

  closeAll(): void {
    for (const connection of this.connections.values()) {
      clearInterval(connection.heartbeat);
      connection.response.write(formatSseEvent({
        event: "server.shutdown",
        data: { reason: "Server shutdown" }
      }));
      connection.response.end();
    }

    this.connections.clear();
  }

  size(): number {
    return this.connections.size;
  }
}

export const sseRegistry = new SseRegistry();
