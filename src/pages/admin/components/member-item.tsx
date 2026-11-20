import { Crown } from "lucide-react";

import { UserAvatar } from "@/components/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Member } from "@/http/fetch-channel-members";
import { cn } from "@/lib/utils";
import { authSlice } from "@/store/auth";

type MemberItemProps = {
  data: Member
  connected?: boolean
};

export function MemberItem({ data, connected }: MemberItemProps) {
  const currentUserId = authSlice(state => state.auth?.user?.id)
  const isMe = currentUserId === data.memberId
  const isAdmin = data.role === 'ADMIN'
  const since = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors',
            'hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring',
            !connected && 'text-muted-foreground',
          )}
        >
          <span className="relative shrink-0">
            <UserAvatar
              name={data.member?.name}
              avatarUrl={data.member?.avatarUrl}
              className={cn('size-6', !connected && 'opacity-60 grayscale')}
            />
            {connected && <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-online ring-2 ring-background" />}
          </span>
          <span className="min-w-0 flex-1 truncate capitalize">
            {data.member.name}
            {isMe && <span className="ml-1 normal-case text-muted-foreground">(você)</span>}
          </span>
          {isAdmin && (
            <Crown className="size-3.5 shrink-0 text-amber-500" aria-label="Administrador" />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center sm:text-center">
          <UserAvatar name={data.member.name} avatarUrl={data.member.avatarUrl} className="mb-2 size-20" />
          <DialogTitle className="capitalize">{data.member.name}</DialogTitle>
          <DialogDescription>{data.member.email}</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg bg-muted/60 p-3 text-sm">
          <dt className="text-muted-foreground">Função</dt>
          <dd className="flex items-center gap-1.5 font-medium">
            {isAdmin && <Crown className="size-3.5 text-amber-500" />}
            {isAdmin ? 'Administrador' : 'Membro'}
          </dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="flex items-center gap-1.5 font-medium">
            <span className={cn('size-2 rounded-full', connected ? 'bg-online' : 'bg-muted-foreground/40')} />
            {connected ? 'Online' : 'Offline'}
          </dd>
          {since && (
            <>
              <dt className="text-muted-foreground">Membro desde</dt>
              <dd className="font-medium">{since}</dd>
            </>
          )}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
