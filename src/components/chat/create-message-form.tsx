
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, AlertCircleIcon, Loader2 } from 'lucide-react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createChannelMessage } from '@/http/create-channel-message';
import { toast } from 'sonner';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { useParams } from 'react-router';
import { Button } from '../ui/button';

const createMessageFormSchema = z.object({
  message: z.string().min(1, 'Adicione uma mensagem')
})


type CreateMessageForm = z.infer<typeof createMessageFormSchema>

const defaultValues: CreateMessageForm = {
  message: ''
}


type CreateMessageFormProps = {
  scrollIntoLastMessage?: () => void
}

export function CreateMessageForm({ scrollIntoLastMessage }: CreateMessageFormProps) {
  const { slug } = useParams()

  const form = useForm<CreateMessageForm>({
    defaultValues,
    resolver: zodResolver(createMessageFormSchema)
  })

  const message = form.watch('message') || ''

  const createChannelMessageMutation = useMutation({
    mutationKey: ['channels', slug],
    mutationFn: async ({ message }: CreateMessageForm) => {
      const { data } = await createChannelMessage({ slug, message })
      return data
    },
    onSuccess: () => {
      form.reset({ message: '' })
      scrollIntoLastMessage()
    },
    onError: (error) => {
      form.setValue('message', message)
      const errorMessage = handleAxiosError(error)
      toast.error(errorMessage)
    },
  })

  const onSubmit = ({ message }: CreateMessageForm) => {
    createChannelMessageMutation.mutate({ message })
  };

  return (
    <div className="border-t border-foreground/10 p-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
        <Controller
          name='message'
          control={form.control}
          render={({ field }) => (
            <Input
              type="text"
              placeholder={`Mensagem...`}
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
  )
}