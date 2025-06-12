import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
} from '../ui/form';
import { Button } from '../ui/button';

import { createChannelMember } from '@/http/create-channel-member';
import { MembersCombobox } from './members-combobox';

const createChannelMemberFormSchema = z.object({
  member_id: z.string().min(1, 'Adicione um titulo para o canal'),
})

type CreateChannelMemberForm = z.infer<typeof createChannelMemberFormSchema>

const defaultValues: CreateChannelMemberForm = {
  member_id: undefined
}

export const ChannelMemberForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navigate = useNavigate()
  const { slug } = useParams()

  const queryClient = useQueryClient()

  const form = useForm<CreateChannelMemberForm>({
    resolver: zodResolver(createChannelMemberFormSchema),
    defaultValues
  })

  const createChannelMutation = useMutation({
    mutationKey: ['members', slug],
    mutationFn: async ({ member_id }: CreateChannelMemberForm) => {
      const { data } = await createChannelMember({ slug, member_id })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', slug] });
      handleCancelCreatingChannel()
      toast.success('Membro adicionado com sucesso')
    },
    onError: (error) => {
      form.setValue('member_id', undefined)
      toast.error(error.message)
    },
  })

  const handleCreateChannel = ({ member_id }: CreateChannelMemberForm) => {
    const [, id] = member_id.split('-')
    createChannelMutation.mutate({ member_id: id })
  };

  const handleCancelCreatingChannel = () => {
    setIsDialogOpen(false)
    form.reset(defaultValues)
    navigate(location.pathname, { replace: true });
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby='create-channel-dialog' aria-description='Adicionar membro'>
        <DialogHeader>
          <DialogTitle>Adicionar membro</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateChannel)} className="space-y-4">
            <FormField
              control={form.control}
              name="member_id"
              render={({ field }) => (
                <FormItem className='flex flex-col gap-0.5'>
                  <FormLabel className="text-sm font-medium text-foreground">Selecione um membro</FormLabel>
                  <FormControl>
                    <MembersCombobox
                      placeholder="Exemplo: Produção"
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
                  'Adicionar membro'
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