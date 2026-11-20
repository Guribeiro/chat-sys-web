import Message from '../messages';
import { Button } from '@/components/ui/button';

import { AlertCircleIcon, Loader2 } from 'lucide-react';

import { MessageItem } from '@/http/fetch-channel-messages';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type MessagesListProps = {
  messages: MessageItem[]
  loading?: boolean
  loadingOlder?: boolean
  hasOlder?: boolean
  error?: string
  onLoadOlder: () => void
}

export function MessagesList({
  messages,
  error,
  loading,
  loadingOlder,
  hasOlder,
  onLoadOlder,
}: MessagesListProps) {
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

  if (loading) {
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
      <div className='flex items-center w-full justify-center mb-2'>
        {hasOlder ? (
          <Button
            variant='outline'
            onClick={onLoadOlder}
            disabled={loadingOlder}
            className='shadow-sm'
          >
            {loadingOlder && <Loader2 className="w-4 h-4 animate-spin" />}
            Carregar mensagens anteriores
          </Button>
        ) : (
          <p className='text-sm text-gray-500'>O chat começa aqui</p>
        )}
      </div>
      {messages.map(message => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  )
}
