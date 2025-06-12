import { useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { fetchChannelMessages, MessageItem } from '@/http/fetch-channel-messages';
import { CreateMessageForm } from './create-message-form';
import { MessagesList } from './messages-list';
import { handleAxiosError } from '@/lib/axios-error-handler';

const ONE_MINUTE_IN_MILLISECONDS = 60000;

type Page = {
  nextPage: number | null
  previousPage: number | null
  messages: MessageItem[]
}

export const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { slug } = useParams()

  const { data, isFetching, error, fetchNextPage } = useInfiniteQuery({
    queryKey: ['channels', slug],
    refetchInterval: ONE_MINUTE_IN_MILLISECONDS,
    refetchOnWindowFocus: true,
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

  const messages = data?.pages.flatMap(page => page.messages).reverse() || [];

  const lastPage = data.pages[data.pages.length - 1]

  return (
    <div className="w-full ">
      <div className="w-full mx-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card className="lg:col-span-4 flex flex-col h-[600px]">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-1">
              <MessagesList
                messages={messages}
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
