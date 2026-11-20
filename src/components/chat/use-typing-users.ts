import { useCallback, useEffect, useRef, useState } from 'react'
import { socket } from '@/socket'

const TYPING_TIMEOUT_MS = 4000

type TypingUser = { userId: string; name: string | null }

/** People currently typing in the channel; each entry expires a few seconds after the last signal. */
export function useTypingUsers(channelId: string | null) {
  const [typing, setTyping] = useState<TypingUser[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const stopTyping = useCallback((userId: string) => {
    clearTimeout(timers.current.get(userId))
    timers.current.delete(userId)
    setTyping((prev) => prev.filter((user) => user.userId !== userId))
  }, [])

  useEffect(() => {
    if (!channelId) return
    const activeTimers = timers.current

    const handleTyping = (payload: { channelId: string; userId: string; name: string | null }) => {
      if (payload.channelId !== channelId) return

      clearTimeout(activeTimers.get(payload.userId))
      activeTimers.set(payload.userId, setTimeout(() => stopTyping(payload.userId), TYPING_TIMEOUT_MS))

      setTyping((prev) =>
        prev.some((user) => user.userId === payload.userId)
          ? prev
          : [...prev, { userId: payload.userId, name: payload.name }],
      )
    }

    socket.on('channel:typing', handleTyping)
    return () => {
      socket.off('channel:typing', handleTyping)
      activeTimers.forEach(clearTimeout)
      activeTimers.clear()
      setTyping([])
    }
  }, [channelId, stopTyping])

  return { typing, stopTyping }
}

export function formatTyping(typing: TypingUser[]) {
  const names = typing.map((user) => user.name ?? 'Alguém')
  if (names.length === 0) return null
  if (names.length === 1) return `${names[0]} está digitando...`
  if (names.length === 2) return `${names[0]} e ${names[1]} estão digitando...`
  return 'Várias pessoas estão digitando...'
}
