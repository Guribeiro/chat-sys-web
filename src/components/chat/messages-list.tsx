import Message from '../messages';
import { Button } from '@/components/ui/button';

import { useEffect, useRef } from 'react';

import { AlertCircleIcon, Loader2 } from 'lucide-react';
import { useParams } from 'react-router';
import { authSlice } from '@/store/auth';

import { MessageItem } from '@/http/fetch-channel-messages';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';


type Page = {
  nextPage: number | null
  previousPage: number | null
  messages: MessageItem[]
}

type MessagesListProps = {
  messages: MessageItem[]
  loading?: boolean
  error?: string
  lastPage?: Page
  fetchNextPage: () => void
}

export function MessagesList({ messages, error, loading, lastPage, fetchNextPage }: MessagesListProps) {
  const { auth } = authSlice(state => state)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          <p>{error}</p>
        </AlertDescription>
      </Alert>
    )
  }

  if (loading && !messages.length) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='flex flex-col items-center justify-center'>
          <p className='text-sm text-gray-500'>Carregando mensagens</p>
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      </div>
    )
  }


  return (
    <div>
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
    </div>
  )
}