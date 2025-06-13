import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../../../components/ui/form';
import { Button } from '../../../components/ui/button';

import { createChannel } from '@/http/create-channel';

const createChannelFormSchema = z.object({
  title: z.string().min(1, 'Adicione um titulo para o canal'),
  description: z.string().min(1, 'Adicione uma descrição para o canal'),
})

type CreateChannelForm = z.infer<typeof createChannelFormSchema>

const defaultValues: CreateChannelForm = {
  title: '',
  description: ''
}

type AdminChannelFormProps = {
  buttonText?: string
}

export const AdminChannelForm = ({ buttonText = 'Criar canal' }: AdminChannelFormProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { search } = useLocation()
  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const searchQueries = useMemo(() => {
    return new URLSearchParams(search)
  }, [search])

  const form = useForm<CreateChannelForm>({
    resolver: zodResolver(createChannelFormSchema),
    defaultValues
  })

  const createChannelMutation = useMutation({
    mutationKey: ['admin', 'channels'],
    mutationFn: async ({ title, description }: CreateChannelForm) => {
      const { data } = await createChannel({ title, description })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels'], });
      handleCancelCreatingChannel()
      toast.success('Canal criado com sucesso')
    },
    onError: (error) => {
      form.setValue('title', '')
      form.setValue('description', '')

      toast.error(error.message)
    },
  })

  const handleCreateChannel = ({ title, description }: CreateChannelForm) => {
    createChannelMutation.mutate({ title, description })
  };

  const handleCancelCreatingChannel = () => {
    setIsDialogOpen(false)
    form.reset(defaultValues)

    navigate(location.pathname, { replace: true });
  }

  useEffect(() => {
    form.setValue('title', searchQueries.get('title') || defaultValues.title)
    form.setValue('description', searchQueries.get('description') || defaultValues.description)
  }, [searchQueries, form])


  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button >
          <Plus className="text-foreground w-4 h-4" />
          <p className="text-foreground hidden lg:flex">{buttonText}</p>
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby='create-channel-dialog' aria-description='Criar canal'>
        <DialogHeader>
          <DialogTitle>Criar canal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateChannel)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className='flex flex-col gap-0.5'>
                  <FormLabel className="text-sm font-medium text-foreground">Título do canal</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      required
                      placeholder="Exemplo: Produção"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className='flex flex-col gap-0.5'>
                  <FormLabel className="text-sm font-medium text-foreground">Descrição do canal</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Sobre o que é esse canal?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button
                type="submit"
                className="flex-1 text-foreground active:bg-primary/60"
                disabled={createChannelMutation.isPending}
              >
                {createChannelMutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  'Criar canal'
                )}

              </Button>
              <Button type="button" variant="outline" onClick={handleCancelCreatingChannel}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}