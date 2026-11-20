import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { createChannel } from '@/http/create-channel';
import { ADMIN_CHANNELS_KEY } from '@/hooks/use-admin-channels';
import { handleAxiosError } from '@/lib/axios-error-handler';

const createChannelFormSchema = z.object({
  title: z.string().trim().min(1, 'Dê um nome ao canal').max(80, 'Use no máximo 80 caracteres'),
  description: z.string().trim().max(500, 'Use no máximo 500 caracteres'),
})

type CreateChannelForm = z.infer<typeof createChannelFormSchema>

const defaultValues: CreateChannelForm = { title: '', description: '' }

type CreateChannelDialogProps = {
  /** The element that opens the dialog */
  trigger: ReactNode
}

/** Creates a group channel (I become its owner) and opens it. */
export function CreateChannelDialog({ trigger }: CreateChannelDialogProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<CreateChannelForm>({
    resolver: zodResolver(createChannelFormSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: async ({ title, description }: CreateChannelForm) =>
      (await createChannel({ title, description: description || null })).data,
    onSuccess: (channel) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      queryClient.invalidateQueries({ queryKey: ADMIN_CHANNELS_KEY })
      handleOpenChange(false)
      toast.success(`Canal #${channel.title} criado. Convide as pessoas pelo menu do canal.`)
      navigate(`/channels/${channel.slug}`)
    },
    onError: (error) => {
      const message = handleAxiosError(error)
      // A duplicate name belongs to the name field
      if (message.includes('título')) form.setError('title', { message })
      else toast.error(message)
    },
  })

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) form.reset(defaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar canal</DialogTitle>
          <DialogDescription>Você será o dono do canal e poderá convidar pessoas em seguida.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(values => mutation.mutate(values))} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Exemplo: Produção" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Descrição <span className="font-normal text-muted-foreground">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Sobre o que é este canal?" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Criar canal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
