import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { fetchChannelMessages, MessageItem } from '@/http/fetch-channel-messages';
import { CreateMessageForm } from './create-message-form';
import { MessagesList } from './messages-list';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { socket } from '@/socket';
import { authSlice } from '@/store/auth';


type Page = {
  nextPage: number | null
  previousPage: number | null
  messages: MessageItem[]
}

export const Chat = () => {
  const { auth } = authSlice(state => state)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const channelIdRef = useRef<string | null>(null)
  const [socketMessages, setSocketMessages] = useState<MessageItem[]>([])

  const { data, isFetching, error, fetchNextPage } = useInfiniteQuery({
    queryKey: ['channels', slug],
    enabled: !!slug,
    initialData: {
      pages: [],
      pageParams: [],
    },
    getNextPageParam: (lastPage: Page) => {
      if (lastPage.nextPage) return lastPage.nextPage
      return lastPage.previousPage
    },
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await fetchChannelMessages({ slug, page: pageParam })
      return data
    },
  })

  const errorMessage = useMemo(() => {
    if (error) return handleAxiosError(error)
  }, [error])


  const lastPage = data.pages[data.pages.length - 1]

  useEffect(() => {
    if (!slug) return

    const join = () => {
      socket.emit('channel:join', { slug }, (response) => {
        if ('error' in response) toast.error(response.error)
        else channelIdRef.current = response.channelId
      })
    }

    // Ignore late events from a channel we already left
    const isCurrentChannel = (channelId: string) => channelIdRef.current === channelId

    const handleNewMessage = ({ channelId, message }: { channelId: string; message: MessageItem }) => {
      if (!isCurrentChannel(channelId)) return
      setSocketMessages((prev) => (prev.some(item => item.id === message.id) ? prev : [...prev, message]));
    };

    const handleMemberRemoved = ({ channelId, userId }: { channelId: string; userId: string }) => {
      if (!isCurrentChannel(channelId)) return
      if (userId === auth?.user?.id) {
        toast.warning('Você foi removido deste canal')
        navigate('/channels')
        return
      }
      queryClient.invalidateQueries({ queryKey: ['members', slug] })
    }

    const handleMemberAdded = ({ channelId }: { channelId: string }) => {
      if (!isCurrentChannel(channelId)) return
      queryClient.invalidateQueries({ queryKey: ['members', slug] })
    }

    const handleChannelDeleted = ({ channelId }: { channelId: string }) => {
      if (!isCurrentChannel(channelId)) return
      toast.warning('Este canal foi removido')
      navigate('/channels')
    }

    const handleChannelUpdated = (payload: { channelId: string; slug: string; active: boolean }) => {
      if (!isCurrentChannel(payload.channelId)) return
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      if (payload.slug !== slug) navigate(`/channels/${payload.slug}`, { replace: true })
    }

    join()
    // Rooms are lost when the connection drops: join again after reconnecting
    socket.on('connect', join)
    socket.on('channel:message', handleNewMessage);
    socket.on('channel:member_removed', handleMemberRemoved)
    socket.on('channel:member_added', handleMemberAdded)
    socket.on('channel:deleted', handleChannelDeleted)
    socket.on('channel:updated', handleChannelUpdated)

    return () => {
      socket.emit('channel:leave', { slug });
      socket.off('connect', join)
      socket.off('channel:message', handleNewMessage);
      socket.off('channel:member_removed', handleMemberRemoved)
      socket.off('channel:member_added', handleMemberAdded)
      socket.off('channel:deleted', handleChannelDeleted)
      socket.off('channel:updated', handleChannelUpdated)
      channelIdRef.current = null
      setSocketMessages([])
    };
  }, [slug, auth?.user?.id, navigate, queryClient]);


  const allMessages = useMemo(() => {
    const fetchedMessages = data?.pages.flatMap(page => page.messages) || [];

    // Deduplicate by id: a message may come both from the HTTP fetch and from the socket
    const seen = new Set<string>()
    return [...fetchedMessages, ...socketMessages].filter(message => {
      if (seen.has(message.id)) return false
      seen.add(message.id)
      return true
    })

  }, [data?.pages, socketMessages])


  return (
    <div className="w-full ">
      <div className="w-full mx-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card className="lg:col-span-4 flex flex-col h-[600px]">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-1">
              <MessagesList
                messages={allMessages}
                error={errorMessage}
                loading={isFetching}
                lastPage={lastPage}
                fetchNextPage={fetchNextPage}
              />
            </CardContent>
            {!errorMessage && (
              <CreateMessageForm scrollIntoLastMessage={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
