import { createContext, useContext } from 'react'
import type { MessageItem } from '@/http/fetch-channel-messages'

type ChatContextValue = {
  slug: string
  currentUserId?: string
  /** Owner/ADMIN of the channel: may delete anyone's messages */
  canModerate: boolean
  /** id -> name of the channel members, to render mention tokens */
  memberNames: Map<string, string | null>
  onReply: (message: MessageItem) => void
  jumpToMessage: (messageId: string) => void
}

export const ChatContext = createContext<ChatContextValue | null>(null)

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat must be used inside <ChatContext.Provider>')
  return context
}
