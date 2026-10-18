import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { findNoteById } from "../modules/notes/notes.repository.js";
import { requireAuthContext } from "../shared/auth/auth-context.js";
import { requireOwner } from "../shared/auth/authorize-owner.js";
import { HttpError } from "../shared/errors/http-error.js";
import { loadNoteReplayEvents, loadUserReplayEvents } from "../realtime/replay.js";
import { formatSseEvent, formatStoredRealtimeEvent } from "./sse-format.js";
import { startSseHeartbeat, stopSseHeartbeat } from "./sse-heartbeat.js";
import { sseRegistry } from "./sse-registry.js";

function prepareSseResponse(response: Parameters<RequestHandler>[1]): void {
  response.status(200);
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders();
}

export const connectUserEvents: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    prepareSseResponse(response);

    const connectionId = randomUUID();
    const heartbeat = startSseHeartbeat(response);

    const cleanup = (): void => {
      stopSseHeartbeat(heartbeat);
      sseRegistry.remove(connectionId);
    };

    request.once("close", cleanup);

    sseRegistry.add({ connectionId, userId: auth.userId, response, heartbeat });

    response.write(formatSseEvent({ event: "connection.ready", data: { connectionId } }));

    const replayEvents = await loadUserReplayEvents(auth.userId, request.header("Last-Event-ID"));
    for (const event of replayEvents) {
      response.write(formatStoredRealtimeEvent(event));
    }
  } catch (error) {
    next(error);
  }
};

export const connectNoteEvents: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const noteId = String(request.params.noteId);
    const note = await findNoteById(noteId);
    if (!note) throw new HttpError(404, "Note was not found.", "NOTE_NOT_FOUND");
    requireOwner(note.ownerId, auth.userId);

    prepareSseResponse(response);

    const connectionId = randomUUID();
    const heartbeat = startSseHeartbeat(response);

    const cleanup = (): void => {
      stopSseHeartbeat(heartbeat);
      sseRegistry.remove(connectionId);
    };

    request.once("close", cleanup);

    sseRegistry.add({ connectionId, userId: auth.userId, noteId: note.id, response, heartbeat });

    response.write(formatSseEvent({ event: "connection.ready", data: { connectionId } }));

    const replayEvents = await loadNoteReplayEvents(auth.userId, note.id, request.header("Last-Event-ID"));
    for (const event of replayEvents) {
      response.write(formatStoredRealtimeEvent(event));
    }
  } catch (error) {
    next(error);
  }
};
