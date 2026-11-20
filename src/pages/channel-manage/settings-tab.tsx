import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Crown, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { updateChannel } from '@/http/update-channel'
import { updateChannelStatus } from '@/http/update-channel-status'
import { deleteChannel } from '@/http/delete-channel'
import type { ChannelDetails } from '@/http/fetch-channel'
import { channelKeys } from '@/hooks/use-channel-details'
import { ADMIN_CHANNELS_KEY } from '@/hooks/use-admin-channels'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { useManagedChannel } from './manage-context'

function useRefreshChannelLists() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['channels'] })
    queryClient.invalidateQueries({ queryKey: ADMIN_CHANNELS_KEY })
  }
}

function StatusCard({ channel }: { channel: ChannelDetails }) {
  const queryClient = useQueryClient()
  const refreshLists = useRefreshChannelLists()

  const mutation = useMutation({
    mutationFn: (active: boolean) => updateChannelStatus({ slug: channel.slug, status: active ? 'ATIVO' : 'INATIVO' }),
    onMutate: (active) => {
      queryClient.setQueryData<ChannelDetails>(channelKeys.details(channel.slug), current => current && { ...current, active })
    },
    onSuccess: (_, active) => {
      refreshLists()
      toast.success(active ? 'Canal reativado' : 'Canal desativado. Ninguém envia mensagens até você reativá-lo.')
    },
    onError: (error, active) => {
      queryClient.setQueryData<ChannelDetails>(channelKeys.details(channel.slug), current => current && { ...current, active: !active })
      toast.error(handleAxiosError(error))
    },
  })

  return (
    <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Label htmlFor="channel-active" className="text-base font-semibold">Canal ativo</Label>
        <p className="text-sm text-muted-foreground">
          Um canal inativo sai da lista de conversas dos membros e não aceita novas mensagens. O histórico é mantido.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {mutation.isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <span className="text-sm text-muted-foreground">{channel.active ? 'Ativo' : 'Inativo'}</span>
        <Switch
          id="channel-active"
          checked={channel.active}
          disabled={mutation.isPending}
          onCheckedChange={(checked) => mutation.mutate(checked)}
        />
      </div>
    </Card>
  )
}

const detailsSchema = z.object({
  title: z.string().trim().min(1, 'Dê um nome ao canal').max(80, 'Use no máximo 80 caracteres'),
  description: z.string().trim().max(500, 'Use no máximo 500 caracteres'),
})
type DetailsForm = z.infer<typeof detailsSchema>

function DetailsCard({ channel }: { channel: ChannelDetails }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const refreshLists = useRefreshChannelLists()

  const form = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    values: { title: channel.title, description: channel.description ?? '' },
  })

  const mutation = useMutation({
    mutationFn: async ({ title, description }: DetailsForm) =>
      (await updateChannel({ slug: channel.slug, title, description: description || null })).data,
    onSuccess: (updated) => {
      refreshLists()
      toast.success('Nome e descrição salvos')
      if (updated.slug !== channel.slug) {
        navigate(`/channels/${updated.slug}/manage/settings`, { replace: true })
      } else {
        queryClient.invalidateQueries({ queryKey: channelKeys.details(channel.slug) })
      }
    },
    onError: (error) => {
      const message = handleAxiosError(error)
      if (message.includes('título')) form.setError('title', { message })
      else toast.error(message)
    },
  })

  return (
    <Card className="grid gap-4 p-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-10">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Nome e descrição</h3>
        <p className="text-sm text-muted-foreground">Aparecem para todos os membros. Mudar o nome também muda o endereço do canal.</p>
      </div>
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
                <FormLabel>Descrição <span className="font-normal text-muted-foreground">(opcional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Sobre o que é este canal?" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            {form.formState.isDirty && (
              <Button type="button" variant="outline" onClick={() => form.reset()}>Descartar</Button>
            )}
            <Button type="submit" disabled={!form.formState.isDirty || mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Salvar alterações
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

function DeleteCard({ channel }: { channel: ChannelDetails }) {
  const navigate = useNavigate()
  const refreshLists = useRefreshChannelLists()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState('')

  const mutation = useMutation({
    // The live "channel deleted" event stays quiet while this runs (see useManageRoom)
    mutationKey: ['delete-channel', channel.slug],
    mutationFn: () => deleteChannel({ slug: channel.slug }),
    onSuccess: () => {
      refreshLists()
      toast.success(`Canal #${channel.title} excluído`)
      navigate('/channels', { replace: true })
    },
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  if (!channel.viewer.isOwner) {
    return (
      <p className="flex items-start gap-2 rounded-xl border px-4 py-3 text-sm text-muted-foreground">
        <Crown className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Somente o dono pode excluir este canal. Se ele não for mais usado, você pode desativá-lo.
      </p>
    )
  }

  return (
    <Card className="flex flex-col gap-4 border-destructive/40 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-destructive">Excluir canal</h3>
        <p className="text-sm text-muted-foreground">Apaga o canal, os membros, as mensagens e os arquivos. Não dá para desfazer.</p>
      </div>
      <Dialog open={open} onOpenChange={(next) => { setOpen(next); setConfirm('') }}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" className="shrink-0">
            <Trash2 className="size-4" />
            Excluir canal
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir #{channel.title}?</DialogTitle>
            <DialogDescription>Todas as mensagens e arquivos do canal serão apagados para todos os membros.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (confirm === channel.slug) mutation.mutate()
            }}
          >
            <Label htmlFor="delete-confirm" className="font-normal text-muted-foreground">
              Para confirmar, digite <span className="font-mono text-foreground">{channel.slug}</span>
            </Label>
            <Input
              id="delete-confirm"
              value={confirm}
              onChange={event => setConfirm(event.target.value)}
              autoComplete="off"
              className="focus-visible:border-destructive focus-visible:ring-destructive/20"
            />
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="destructive" disabled={confirm !== channel.slug || mutation.isPending}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Excluir para sempre
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export function SettingsTab() {
  const channel = useManagedChannel()
  return (
    <section aria-labelledby="settings-heading" className="flex flex-col gap-4">
      <h2 id="settings-heading" className="sr-only">Configurações do canal</h2>
      <StatusCard channel={channel} />
      <DetailsCard channel={channel} />
      <DeleteCard channel={channel} />
    </section>
  )
}
