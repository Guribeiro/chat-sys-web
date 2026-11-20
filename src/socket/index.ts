import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from './events';

const URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  autoConnect: false,
});

/** Connects the socket authenticated with the user's JWT (no-op if already connected). */
export function connectSocket(token: string) {
  socket.auth = { token }
  if (!socket.connected) socket.connect()
}

/**
 * A refreshed access token only matters for the next handshake: an open connection was
 * authenticated already, so it is kept as is (no reconnect, rooms stay joined).
 */
export function setSocketToken(token: string | null) {
  socket.auth = token ? { token } : {}
}

export function disconnectSocket() {
  socket.auth = {}
  socket.disconnect()
}

let onUnauthorized: (() => Promise<string | null>) | null = null

/** Handshake refused (expired token, e.g. after the laptop slept): refresh once and retry. */
export function onSocketUnauthorized(handler: () => Promise<string | null>) {
  onUnauthorized = handler
}

socket.on('connect_error', async (error) => {
  if (error.message !== 'unauthorized' || !onUnauthorized) return
  const token = await onUnauthorized()
  if (token) connectSocket(token)
})
