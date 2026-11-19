import { create } from 'zustand'
import { socket } from '@/socket'

interface PresenceState {
  onlineIds: Set<string>
  isOnline: (userId?: string) => boolean
}

export const usePresence = create<PresenceState>()((_, get) => ({
  onlineIds: new Set(),
  isOnline: (userId) => !!userId && get().onlineIds.has(userId),
}))

// One global listener for the whole app (components only read from the store)
function setOnline(userIds: string[]) {
  usePresence.setState({ onlineIds: new Set(userIds) })
}

socket.on('presence:snapshot', setOnline)
socket.on('presence:update', setOnline)
socket.on('disconnect', () => setOnline([]))
