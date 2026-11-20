import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from './events';

const URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  autoConnect: false,
});

/** Connects (or reconnects) the socket authenticated with the user's JWT. */
export function connectSocket(token: string) {
  const current = (socket.auth as { token?: string } | undefined)?.token
  if (socket.connected && current === token) return

  socket.auth = { token }
  if (socket.connected) socket.disconnect()
  socket.connect()
}

export function disconnectSocket() {
  socket.auth = {}
  socket.disconnect()
}
