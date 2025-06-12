import { useEffect, useRef } from 'react';
import Message from '../messages';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircleIcon, Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { authSlice } from '@/store/auth';

import { fetchChannelMessages, MessageItem } from '@/http/fetch-channel-messages';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CreateMessageForm } from './create-message-form';

const ONE_MINUTE_IN_MILLISECONDS = 60000;

type Page = {
  nextPage: number | null
  previousPage: number | null
  messages: MessageItem[]
}

export const Chat = () => {
  const { auth } = authSlice(state => state)
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


  const messages = data?.pages.flatMap(page => page.messages).reverse() || [];

  const lastPage = data.pages[data.pages.length - 1]


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data])


  return (
    <div className="w-full ">
      <div className="w-full mx-auto ">
        {error ? (
          <Alert variant='destructive' className='w-full'>
            <AlertCircleIcon />
            <AlertTitle>{'erro'}</AlertTitle>
            <AlertDescription>
              <p>{'algo deu errado'}</p>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card className="lg:col-span-4 flex flex-col h-[600px]">
              <>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-1">
                  {isFetching && !messages.length ? (
                    <div className='flex items-center justify-center h-full'>
                      <div className='flex flex-col items-center justify-center'>
                        <p className='text-sm text-gray-500'>Carregando mensagens</p>
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className='flex items-center w-full justify-center'>
                        {lastPage?.nextPage ? (
                          <Button
                            variant='outline'
                            onClick={() => fetchNextPage()}
                            className='shadow-sm'
                          >
                            Carregar mensagens anteriores
                          </Button>
                        ) : (
                          <p className='text-sm text-gray-500'>O chat começa aqui</p>
                        )}
                      </div>
                      {messages.map(message => (
                        <Message
                          key={message.id}
                          message={{
                            id: message.id,
                            content: message.conteudo,
                            isCurrentUser: auth.user.id === message.usuario_id,
                            timestamp: new Date(message.enviado_em),
                            username: message.usuario_nome,
                          }}
                        />
                      ))}

                      <div ref={messagesEndRef} />
                    </>

                  )}

                </CardContent>
                <CreateMessageForm scrollIntoLastMessage={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })} />
              </>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
