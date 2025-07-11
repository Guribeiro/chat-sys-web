import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Outlet, useNavigate, useParams } from 'react-router';
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
} from '../../../components/ui/form';
import { Button } from '../../../components/ui/button';

import { createChannelMember } from '@/http/create-channel-member';
import { MembersCombobox } from '../../../components/channel-members-sidebar/members-combobox';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createChannelInvite } from '@/http/create-channel-invite';
import { roleSchema } from '@/schemas';

const createChannelMemberFormSchema = z.object({
  invitee_id: z.string().min(1, 'Adicione um titulo para o canal'),
  role: roleSchema
})

type CreateChannelMemberForm = z.infer<typeof createChannelMemberFormSchema>

const defaultValues: CreateChannelMemberForm = {
  invitee_id: undefined
}

export const AdminChannelMemberForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navigate = useNavigate()
  const { slug } = useParams()

  const queryClient = useQueryClient()

  const form = useForm<CreateChannelMemberForm>({
    resolver: zodResolver(createChannelMemberFormSchema),
    defaultValues
  })

  const createInvite = useMutation({
    mutationKey: ['admin', 'channels', 'members', slug],
    mutationFn: async ({ invitee_id, role }: CreateChannelMemberForm) => {
      const { data } = await createChannelInvite({ slug, invitee_id, role })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels', 'members', slug] });
      handleCancelCreatingChannel()
      toast.success('Membro adicionado com sucesso')
    },
    onError: (error) => {
      const errorMessage = handleAxiosError(error)
      form.setValue('invitee_id', undefined)
      form.setError('invitee_id', { message: errorMessage })
    },
  })

  const handleCreateInvite = ({ invitee_id, role }: CreateChannelMemberForm) => {
    const [, id] = invitee_id.split('/')
    createInvite.mutate({ invitee_id: id, role })
  };

  const handleCancelCreatingChannel = () => {
    setIsDialogOpen(false)
    form.reset(defaultValues)
    navigate(location.pathname, { replace: true });
  }

  return (
    <div className='flex flex-col gap-4'>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className='flex justify-end'>
          <DialogTrigger asChild>
            <Button variant="outline" size='sm'>
              <Plus className="w-4 h-4" />
              <p className='text-foreground hidden lg:flex'>Convidar membro</p>
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent aria-describedby='create-channel-dialog' aria-description='Convidar membro'>
          <DialogHeader>
            <DialogTitle>Convidar membro</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateInvite)} className="space-y-4">
              <FormField
                control={form.control}
                name="invitee_id"
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-0.5'>
                    <FormLabel className="text-sm font-medium text-foreground">Select a member</FormLabel>
                    <FormControl>
                      <MembersCombobox
                        placeholder="Buscar usuário..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-0.5'>
                    <FormLabel className="text-sm font-medium text-foreground">Select the member role</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger >
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup >
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="flex-1 text-foreground active:bg-primary/60"
                  disabled={createInvite.isPending}
                >
                  {createInvite.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    'Convidar membro'
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
      <Outlet />
    </div>
  )
}