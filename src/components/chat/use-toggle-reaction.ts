import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { toggleMessageReaction } from '@/http/toggle-message-reaction'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { authSlice } from '@/store/auth'
import { findMessage, patchMessage } from './messages-cache'

/** Toggle with an optimistic update; the server (and the socket event) send back the real list. */
export function useToggleReaction(slug: string, messageId: string) {
  const queryClient = useQueryClient()
  const user = authSlice(state => state.auth?.user)

  return useMutation({
    mutationFn: async (emoji: string) => (await toggleMessageReaction({ slug, messageId, emoji })).data,
    onMutate: (emoji) => {
      const current = findMessage(queryClient, slug, messageId)?.reactions ?? []
      const mine = current.some(reaction => reaction.emoji === emoji && reaction.userId === user?.id)
      const next = mine
        ? current.filter(reaction => !(reaction.emoji === emoji && reaction.userId === user?.id))
        : [...current, { emoji, userId: user?.id, user: { name: user?.name ?? null } }]
      patchMessage(queryClient, slug, messageId, { reactions: next })
      return current
    },
    onSuccess: ({ reactions }) => patchMessage(queryClient, slug, messageId, { reactions }),
    onError: (error, _emoji, previous) => {
      if (previous) patchMessage(queryClient, slug, messageId, { reactions: previous })
      toast.error(handleAxiosError(error))
    },
  })
}
