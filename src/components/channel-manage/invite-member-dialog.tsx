import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MembersCombobox } from '@/components/channel-members-sidebar/members-combobox';
import { createChannelInvite } from '@/http/create-channel-invite';
import { channelKeys, useChannelInvites, useChannelMembers } from '@/hooks/use-channel-details';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { roleSchema } from '@/schemas';

const inviteFormSchema = z.object({
  invitee_id: z.string({ required_error: 'Escolha quem você quer convidar' }).min(1, 'Escolha quem você quer convidar'),
  role: roleSchema,
})

type InviteForm = z.infer<typeof inviteFormSchema>

const defaultValues: Partial<InviteForm> = { invitee_id: undefined, role: 'MEMBER' }

type InviteMemberDialogProps = {
  slug: string
  channelTitle?: string
  /** Uncontrolled use: the element that opens the dialog */
  trigger?: ReactNode
  /** Controlled use (e.g. opened from a menu item) */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/** Invites someone to a channel. Current members and people already invited are not offered. */
export function InviteMemberDialog({ slug, channelTitle, trigger, open: openProp, onOpenChange }: InviteMemberDialogProps) {
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const queryClient = useQueryClient()

  const { data: members } = useChannelMembers(open ? slug : undefined)
  const { data: invites } = useChannelInvites(slug, { enabled: open })
  const excludeIds = [
    ...(members ?? []).map(member => member.memberId),
    ...(invites ?? []).map(invite => invite.invitee.id),
  ]

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues,
  })

  function setOpen(next: boolean) {
    if (!next) form.reset(defaultValues)
    if (openProp === undefined) setOpenState(next)
    onOpenChange?.(next)
  }

  const mutation = useMutation({
    mutationFn: async ({ invitee_id, role }: InviteForm) => (await createChannelInvite({ slug, invitee_id: invitee_id!, role: role ?? 'MEMBER' })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelKeys.invites(slug) })
      setOpen(false)
      toast.success('Convite enviado. A pessoa entra no canal quando aceitar.')
    },
    onError: (error) => form.setError('invitee_id', { message: handleAxiosError(error) }),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar pessoas</DialogTitle>
          <DialogDescription>
            {channelTitle ? `A pessoa recebe o convite e entra em #${channelTitle} quando aceitar.` : 'A pessoa entra no canal quando aceitar o convite.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(values => mutation.mutate(values))} className="space-y-4">
            <FormField
              control={form.control}
              name="invitee_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Pessoa</FormLabel>
                  <FormControl>
                    <MembersCombobox
                      value={field.value}
                      onChange={(id) => {
                        field.onChange(id)
                        form.clearErrors('invitee_id')
                      }}
                      excludeIds={excludeIds}
                      aria-invalid={!!fieldState.error}
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
                <FormItem>
                  <FormLabel>Papel no canal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um papel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MEMBER">Membro</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Administradores convidam pessoas, editam o canal e moderam mensagens.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Enviar convite
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
