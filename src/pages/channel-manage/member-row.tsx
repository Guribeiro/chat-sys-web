import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Crown, Loader2, MoreHorizontal, Shield, ShieldOff, UserMinus, ArrowRightLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserAvatar } from '@/components/user-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { removeMemberFromChannel } from '@/http/remove-member-from-channel'
import { transferChannelOwnership, updateMemberRole, type Member } from '@/http/fetch-channel-members'
import type { ChannelDetails } from '@/http/fetch-channel'
import { channelKeys } from '@/hooks/use-channel-details'
import { ADMIN_CHANNELS_KEY } from '@/hooks/use-admin-channels'
import { handleAxiosError } from '@/lib/axios-error-handler'
import type { Role } from '@/schemas'

type MemberRowProps = {
  member: Member
  channel: ChannelDetails
  currentUserId?: string
}

/** Mirrors the API rules, so the menu only offers what will succeed. */
function permissionsFor(member: Member, channel: ChannelDetails, currentUserId?: string) {
  const isMe = member.memberId === currentUserId
  const { isOwner: iAmOwner, isAdmin: iAmAdmin } = channel.viewer
  const editable = !isMe && !member.isOwner
  return {
    isMe,
    promote: editable && iAmAdmin && member.role === 'MEMBER',
    demote: editable && iAmOwner && member.role === 'ADMIN',
    transfer: !isMe && iAmOwner,
    remove: editable && (member.role === 'MEMBER' || iAmOwner),
  }
}

function RoleLabel({ member }: { member: Member }) {
  if (member.isOwner) {
    return (
      <span className="flex items-center gap-1.5 text-sm font-medium">
        <Crown className="size-3.5 text-muted-foreground" aria-hidden="true" />
        Dono
      </span>
    )
  }
  if (member.role === 'ADMIN') {
    return (
      <span className="flex items-center gap-1.5 text-sm font-medium">
        <Shield className="size-3.5 text-muted-foreground" aria-hidden="true" />
        Administrador
      </span>
    )
  }
  // The default role: implied on narrow screens, where the e-mail needs the room
  return <span className="text-sm text-muted-foreground max-sm:sr-only">Membro</span>
}

export function MemberRow({ member, channel, currentUserId }: MemberRowProps) {
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<'remove' | 'transfer' | null>(null)
  const [confirmName, setConfirmName] = useState('')
  const can = permissionsFor(member, channel, currentUserId)
  const hasActions = can.promote || can.demote || can.transfer || can.remove
  const name = member.member.name
  const slug = channel.slug

  const since = member.createdAt
    ? new Date(member.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    : null

  const roleMutation = useMutation({
    mutationFn: async (role: Role) => (await updateMemberRole({ slug, memberId: member.id, role })).data,
    onSuccess: (updated) => {
      queryClient.setQueryData<Member[]>(channelKeys.members(slug), members =>
        members?.map(row => (row.id === member.id ? { ...row, role: updated.role } : row)),
      )
      toast.success(updated.role === 'ADMIN' ? `${name} agora é administrador do canal` : `${name} agora é membro do canal`)
    },
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  const removeMutation = useMutation({
    mutationFn: () => removeMemberFromChannel({ slug, member_id: member.id }),
    onSuccess: () => {
      queryClient.setQueryData<Member[]>(channelKeys.members(slug), members => members?.filter(row => row.id !== member.id))
      setDialog(null)
      toast.success(`${name} não faz mais parte do canal`)
    },
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  const transferMutation = useMutation({
    mutationFn: () => transferChannelOwnership({ slug, memberId: member.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelKeys.details(slug) })
      queryClient.invalidateQueries({ queryKey: channelKeys.members(slug) })
      queryClient.invalidateQueries({ queryKey: ADMIN_CHANNELS_KEY })
      setDialog(null)
      toast.success(`A posse do canal passou para ${name}. Você continua como administrador.`)
    },
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  function openDialog(kind: 'remove' | 'transfer') {
    setConfirmName('')
    setDialog(kind)
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <UserAvatar name={name} avatarUrl={member.member.avatarUrl} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {name}
          {can.isMe && <span className="ml-1 font-normal text-muted-foreground">(você)</span>}
        </p>
        <p className="truncate text-sm text-muted-foreground">{member.member.email}</p>
      </div>
      <span className="hidden w-36 shrink-0 whitespace-nowrap text-sm text-muted-foreground tabular md:block">{since && `Desde ${since}`}</span>
      <span className="w-32 shrink-0 max-sm:w-auto">
        {roleMutation.isPending ? (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Alterando...
          </span>
        ) : (
          <RoleLabel member={member} />
        )}
      </span>

      <div className="size-9 shrink-0">
        {hasActions && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" aria-label={`Ações para ${name}`}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {can.promote && (
                <DropdownMenuItem onSelect={() => roleMutation.mutate('ADMIN')}>
                  <Shield className="mr-2 size-4" />
                  Tornar administrador
                </DropdownMenuItem>
              )}
              {can.demote && (
                <DropdownMenuItem onSelect={() => roleMutation.mutate('MEMBER')}>
                  <ShieldOff className="mr-2 size-4" />
                  Tornar membro
                </DropdownMenuItem>
              )}
              {can.transfer && (
                <DropdownMenuItem onSelect={() => openDialog('transfer')}>
                  <ArrowRightLeft className="mr-2 size-4" />
                  Transferir posse do canal...
                </DropdownMenuItem>
              )}
              {can.remove && (
                <>
                  {(can.promote || can.demote || can.transfer) && <DropdownMenuSeparator />}
                  <DropdownMenuItem onSelect={() => openDialog('remove')} className="text-destructive focus:text-destructive">
                    <UserMinus className="mr-2 size-4" />
                    Remover do canal...
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog open={dialog === 'remove'} onOpenChange={open => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remover {name} do canal?</DialogTitle>
            <DialogDescription>
              A pessoa deixa de ver #{channel.title} e todas as mensagens do canal. Você pode convidá-la de novo depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialog(null)}>Cancelar</Button>
            <Button variant="destructive" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate()}>
              {removeMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Remover do canal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'transfer'} onOpenChange={open => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transferir #{channel.title} para {name}?</DialogTitle>
            <DialogDescription>
              A posse passa para {name}, que poderá excluir o canal, rebaixar administradores e transferir a posse de novo.
              Você continua como administrador.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (confirmName.trim() === name) transferMutation.mutate()
            }}
          >
            <Label htmlFor={`transfer-${member.id}`} className="font-normal text-muted-foreground">
              Para confirmar, digite <span className="font-medium text-foreground">{name}</span>
            </Label>
            <Input
              id={`transfer-${member.id}`}
              value={confirmName}
              onChange={event => setConfirmName(event.target.value)}
              autoComplete="off"
            />
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancelar</Button>
              <Button type="submit" disabled={confirmName.trim() !== name || transferMutation.isPending}>
                {transferMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Transferir posse
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </li>
  )
}
