import { Link } from "react-router";
import { ChevronRight, Crown, Hash, Users } from "lucide-react";

import { Channel } from "@/http/fetch-channels"
import { cn } from "@/lib/utils";

type AdminChannelCardProps = {
  data: Channel
  isOwner: boolean
}

/** One channel row in the admin list; the whole row opens the channel's management, inside the workspace. */
export function AdminChannelCard({ data: channel, isOwner }: AdminChannelCardProps) {
  const members = channel._count.members

  return (
    <li>
      <Link
        to={`/channels/${channel.slug}/manage`}
        className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Hash className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{channel.title}</span>
            {isOwner && (
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Crown className="size-3" aria-hidden="true" />
                Dono
              </span>
            )}
          </span>
          <span className="block truncate text-sm text-muted-foreground">{channel.description || 'Sem descrição'}</span>
        </span>
        <span className="hidden items-center gap-1.5 text-sm text-muted-foreground tabular sm:flex" aria-label={`${members} ${members === 1 ? 'membro' : 'membros'}`}>
          <Users className="size-4" aria-hidden="true" />
          {members}
        </span>
        <span className={cn(
          'flex w-20 items-center gap-1.5 text-xs font-medium',
          channel.active ? 'text-foreground' : 'text-muted-foreground',
        )}>
          <span className={cn('size-1.5 rounded-full', channel.active ? 'bg-online' : 'bg-muted-foreground/50')} aria-hidden="true" />
          {channel.active ? 'Ativo' : 'Inativo'}
        </span>
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </li>
  )
}
