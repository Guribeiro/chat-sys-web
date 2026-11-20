import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { socket } from '@/socket'

/** Shows a toast when someone mentions me in a channel I am not looking at. */
export function MentionNotifier() {
  const { slug } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const handleMention = (payload: {
      channelSlug: string
      channelTitle: string
      author: { name: string | null }
      preview: string
    }) => {
      const isWatching = payload.channelSlug === slug && document.visibilityState === 'visible'
      if (isWatching) return

      toast(`${payload.author.name ?? 'Alguém'} mencionou você em #${payload.channelTitle}`, {
        description: payload.preview,
        duration: 8000,
        action: {
          label: 'Abrir',
          onClick: () => navigate(`/channels/${payload.channelSlug}`),
        },
      })
    }

    socket.on('notification:mention', handleMention)
    return () => {
      socket.off('notification:mention', handleMention)
    }
  }, [slug, navigate])

  return null
}
