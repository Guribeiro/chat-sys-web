import { UserAvatar } from "@/components/user-avatar";
import { removeMemberFromChannel } from "@/http/remove-member-from-channel"
import { Member } from "@/http/fetch-channel-members"
import { handleAxiosError } from "@/lib/axios-error-handler"
import { authSlice } from "@/store/auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { toast } from "sonner"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../../../components/ui/button";
import { Crown, Loader2, UserMinus } from "lucide-react"
import { cn } from "@/lib/utils"


type ChannelMemberListItemProps = {
  data: Member
}

export function ChannelMemberListItem({ data: member }: ChannelMemberListItemProps) {
  const { slug } = useParams()

  const { auth } = authSlice(state => state)

  const queryClient = useQueryClient()

  const removeMemberFromChannelMutation = useMutation({
    mutationKey: ['admin', 'channels', 'members', slug],
    mutationFn: async ({ member_id }: { member_id: string }) => {
      const { data } = await removeMemberFromChannel({ slug, member_id })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels', 'members', slug] });
      toast.success('Membro removido com sucesso')
    },
    onError: (error) => {
      const errorMessage = handleAxiosError(error)
      toast.error(errorMessage)
    },
  })
  const isMe = auth?.user?.id === member.member.id
  const isAdmin = member.role === 'ADMIN'
  const canRemove = !isMe && !isAdmin
  const since = member.createdAt
    ? new Date(member.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <UserAvatar name={member.member.name} avatarUrl={member.member.avatarUrl} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {member.member.name}
          {isMe && <span className="ml-1 font-normal text-muted-foreground">(você)</span>}
        </p>
        <p className="truncate text-sm text-muted-foreground">{member.member.email}</p>
      </div>
      <span className="hidden w-32 text-sm text-muted-foreground sm:block">{since && `Desde ${since}`}</span>
      <span className={cn('flex w-28 items-center gap-1.5 text-sm', isAdmin ? 'font-medium' : 'text-muted-foreground')}>
        {isAdmin && <Crown className="size-3.5 text-amber-500" />}
        {isAdmin ? 'Administrador' : 'Membro'}
      </span>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canRemove}
            aria-label={`Remover ${member.member.name} do canal`}
            title={canRemove ? 'Remover do canal' : isMe ? 'Você não pode remover a si mesmo' : 'Administradores não podem ser removidos'}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <UserMinus className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remover {member.member.name}?</DialogTitle>
            <DialogDescription>
              A pessoa deixa de ver o canal e as mensagens. Você pode convidá-la de novo depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={removeMemberFromChannelMutation.isPending}
              onClick={() => removeMemberFromChannelMutation.mutate({ member_id: member.id })}
            >
              {removeMemberFromChannelMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Remover do canal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  )
}
