import { Link } from "react-router";
import { ChevronRight, Hash, Users } from "lucide-react";

import { Channel } from "@/http/fetch-channels"
import { cn } from "@/lib/utils";

type AdminChannelCardProps = {
  data: Channel
}

/** One channel row in the admin list; the whole row opens the channel's settings. */
export function AdminChannelCard({ data: channel }: AdminChannelCardProps) {
  return (
    <li>
      <Link
        to={`/admin/channels/${channel.slug}/members`}
        className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Hash className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{channel.title}</span>
          <span className="block truncate text-sm text-muted-foreground">{channel.description || 'Sem descrição'}</span>
        </span>
        <span className="hidden items-center gap-1.5 text-sm text-muted-foreground tabular sm:flex">
          <Users className="size-4" />
          {channel._count.members}
        </span>
        <span className={cn(
          'flex w-20 items-center gap-1.5 text-xs font-medium',
          channel.active ? 'text-foreground' : 'text-muted-foreground',
        )}>
          <span className={cn('size-1.5 rounded-full', channel.active ? 'bg-online' : 'bg-muted-foreground/50')} />
          {channel.active ? 'Ativo' : 'Inativo'}
        </span>
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  )
}
