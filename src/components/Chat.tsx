
import { useRef } from 'react';
import Message from './messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, AlertCircleIcon, Loader2 } from 'lucide-react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { authSlice } from '@/store/auth';

import { fetchChannelMessages, MessageItem } from '@/http/fetch-channel-messages';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createChannelMessage } from '@/http/create-channel-message';

const ONE_MINUTE_IN_MILLISECONDS = 60000;


const createMessageFormSchema = z.object({
  message: z.string().min(1, 'Adicione uma mensagem')
})

type CreateMessageForm = z.infer<typeof createMessageFormSchema>

type Page = {
  nextPage: number | null
  previousPage: number | null
  messages: MessageItem[]
}

const Chat = () => {
  const { auth } = authSlice(state => state)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { channelId } = useParams()

  const queryClient = useQueryClient()

  const form = useForm<CreateMessageForm>({
    resolver: zodResolver(createMessageFormSchema)
  })

  const message = form.watch('message')

  const { data, isFetching, error, fetchNextPage } = useInfiniteQuery({
    queryKey: ['channels', channelId],
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
      const { data } = await fetchChannelMessages({ channelId, page: pageParam })
      return data
    },
  })

  const createChannelMessageMutation = useMutation({
    mutationKey: ['channels', channelId],
    mutationFn: async ({ message }: CreateMessageForm) => {
      const { data } = await createChannelMessage({ channelId, message })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', channelId] });
      form.reset({ message: '' })
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    },
    onError: (error) => {
      form.setValue('message', message)
      form.setError('message', { type: 'validate', message: error.message })
    },
  })

  const messages = data?.pages.flatMap(page => page.messages).reverse() || [];

  const lastPage = data.pages[data.pages.length - 1]

  const onSubmit = ({ message }: CreateMessageForm) => {
    createChannelMessageMutation.mutate({ message })
  };


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
                </CardContent>
                <div className="border-t border-foreground/10 p-4">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
                    <Controller
                      name='message'
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          type="text"
                          placeholder={`Messagem...`}
                          className="flex-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          {...field}
                        />
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={!message?.trim() || createChannelMessageMutation.isPending}
                      className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-700 cursor-pointer text-white px-6"
                    >
                      {createChannelMessageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
