import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/pt-br'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircleIcon, Loader2, MailPlus, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/user-avatar'
import { InviteMemberDialog } from '@/components/channel-manage/invite-member-dialog'
import { channelKeys, useChannelInvites } from '@/hooks/use-channel-details'
import { revokeChannelInvite, type ChannelInvite } from '@/http/channel-invites'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { useManagedChannel } from './manage-context'

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

function InviteRow({ invite, slug }: { invite: ChannelInvite; slug: string }) {
  const queryClient = useQueryClient()
  const revoke = useMutation({
    mutationFn: () => revokeChannelInvite({ slug, inviteId: invite.id }),
    onSuccess: () => {
      queryClient.setQueryData<ChannelInvite[]>(channelKeys.invites(slug), invites => invites?.filter(row => row.id !== invite.id))
      toast.success(`Convite de ${invite.invitee.name} revogado`)
    },
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  const sent = dayjs(invite.createdAt)

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <UserAvatar name={invite.invitee.name} avatarUrl={invite.invitee.avatarUrl} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{invite.invitee.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          <time dateTime={invite.createdAt} title={sent.format('DD/MM/YYYY HH:mm')}>Enviado {sent.fromNow()}</time>
          {' por '}{invite.author.name}
        </p>
      </div>
      <span className="hidden w-28 shrink-0 text-sm text-muted-foreground sm:block">
        {invite.role === 'ADMIN' ? 'Administrador' : 'Membro'}
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={revoke.isPending}
        onClick={() => revoke.mutate()}
        aria-label={`Revogar o convite de ${invite.invitee.name}`}
        className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        {revoke.isPending && <Loader2 className="size-4 animate-spin" />}
        Revogar
      </Button>
    </li>
  )
}

export function InvitesTab() {
  const channel = useManagedChannel()
  const { data, isPending, error } = useChannelInvites(channel.slug)

  const inviteButton = (
    <Button size="sm">
      <UserPlus className="size-4" />
      Convidar pessoas
    </Button>
  )

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Não foi possível carregar os convites</AlertTitle>
        <AlertDescription><p>{handleAxiosError(error)}</p></AlertDescription>
      </Alert>
    )
  }

  return (
    <section aria-labelledby="invites-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="invites-heading" className="text-base font-semibold">Convites pendentes</h2>
          <p className="text-sm text-muted-foreground">Quem foi convidado e ainda não respondeu. Revogar retira o convite na hora.</p>
        </div>
        {!!data?.length && <InviteMemberDialog slug={channel.slug} channelTitle={channel.title} trigger={inviteButton} />}
      </div>

      {isPending ? (
        <ul className="divide-y overflow-hidden rounded-xl border" aria-busy="true">
          {[0, 1].map(index => (
            <li key={index} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
            </li>
          ))}
        </ul>
      ) : !data?.length ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-12 text-center">
          <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <MailPlus className="size-5" />
          </span>
          <p className="text-sm font-medium">Nenhum convite pendente</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Convites aceitos viram membros; recusados ou revogados somem desta lista.
          </p>
          <div className="mt-5">
            <InviteMemberDialog slug={channel.slug} channelTitle={channel.title} trigger={inviteButton} />
          </div>
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border">
          {data.map(invite => <InviteRow key={invite.id} invite={invite} slug={channel.slug} />)}
        </ul>
      )}
    </section>
  )
}
