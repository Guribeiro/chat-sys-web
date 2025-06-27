import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

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
      console.log(data)
      return data
    },
  })

  const errorMessage = useMemo(() => {
    if (error) return handleAxiosError(error)
  }, [error])


  const lastPage = data.pages[data.pages.length - 1]

  useEffect(() => {
    if (!slug) return

    socket.emit('chat:user_joined', { channel: slug, user: auth.user });

    // Store the function in a variable
    const handleNewMessage = (message: MessageItem) => {
      setSocketMessages((prevMessages) => [...prevMessages, message]);
    };

    // Attach the listener using the named function
    socket.on('channel:send_message', handleNewMessage);

    return () => {
      socket.emit('chat:user_left', { channel: slug });
      socket.off('channel:send_message', handleNewMessage);
      setSocketMessages([])
    };
  }, [slug, auth.user]);


  const allMessages = useMemo(() => {
    const fetchedMessages = data?.pages.flatMap(page => page.messages) || [];

    const combined = [...fetchedMessages, ...socketMessages];
    return combined;

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
