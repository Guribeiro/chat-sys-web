import { useEffect, useState, type ReactNode } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { Channel } from '@/http/fetch-channels';
import { useChannels } from '@/hooks/use-channels';
import { cn } from '@/lib/utils';
import { socket } from '@/socket';
import { authSlice } from '@/store/auth';
import { ChannelList } from './channel-list';
import { NewDirectMessage } from './new-direct-message';
import { CreateChannelDialog } from '../channel-manage/create-channel-dialog';
import { Button } from '../ui/button';

type SectionProps = {
  title: string
  channels: Channel[] | undefined
  loading: boolean
  error?: string
  emptyTitle: string
  emptyContent?: string
  action?: ReactNode
}

function SidebarSection({ title, channels, loading, error, emptyTitle, emptyContent, action }: SectionProps) {
  const [open, setOpen] = useState(true)
  const totalUnread = channels?.reduce(
    (total, channel) => total + (channel.muted ? channel.unreadMentionCount ?? 0 : channel.unreadCount ?? 0),
    0,
  ) ?? 0

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <section aria-label={title}>
        <div className="flex h-8 items-center gap-1 pr-1">
          <CollapsibleTrigger className="flex h-7 min-w-0 flex-1 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
            <ChevronRight className={cn('size-3.5 shrink-0 transition-transform duration-200', open && 'rotate-90')} />
            <span className="truncate">{title}</span>
            {!open && totalUnread > 0 && (
              <span className="ml-1 rounded-full bg-unread px-1.5 text-[10px] font-semibold leading-4 text-unread-foreground tabular">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </CollapsibleTrigger>
          {action}
        </div>
        <CollapsibleContent className="collapsible-content overflow-hidden">
          <ChannelList
            channels={channels}
            error={error}
            loading={loading}
            emptyTitle={emptyTitle}
            emptyContent={emptyContent}
          />
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}

export const ChannelSidebar = () => {
  const { slug } = useParams()
  const queryClient = useQueryClient()
  const userId = authSlice(state => state.auth?.user?.id)

  const { data, isFetching, error } = useChannels()

  useEffect(() => {
    // Bump the unread badge of channels that are not open when someone else posts there
    const handleActivity = ({ channelId, authorId }: { channelId: string; authorId: string }) => {
      if (authorId === userId) return
      const channels = queryClient.getQueryData<Channel[]>(['channels'])
      // A conversation I do not know yet (e.g. a brand-new DM): reload the list
      if (channels && !channels.some(channel => channel.id === channelId)) {
        queryClient.invalidateQueries({ queryKey: ['channels'] })
        return
      }
      queryClient.setQueryData<Channel[]>(['channels'], (current) =>
        current?.map(channel =>
          channel.id === channelId && channel.slug !== slug
            ? { ...channel, unreadCount: (channel.unreadCount ?? 0) + 1 }
            : channel,
        ),
      )
    }

    // Someone opened a DM with me (or I joined a channel): show it
    const handleMemberAdded = ({ userId: addedId }: { userId: string }) => {
      if (addedId === userId) queryClient.invalidateQueries({ queryKey: ['channels'] })
    }

    socket.on('channel:activity', handleActivity)
    socket.on('channel:member_added', handleMemberAdded)
    return () => {
      socket.off('channel:activity', handleActivity)
      socket.off('channel:member_added', handleMemberAdded)
    }
  }, [queryClient, slug, userId])

  const groups = data?.filter(channel => channel.type !== 'DIRECT')
  const directs = data?.filter(channel => channel.type === 'DIRECT')
  const loading = isFetching && !data

  return (
    <nav aria-label="Conversas" className="flex h-full flex-col gap-4 overflow-y-auto px-2 py-3">
      <SidebarSection
        title="Canais"
        channels={groups}
        loading={loading}
        error={error?.message}
        emptyTitle="Nenhum canal ainda"
        emptyContent="Aceite um convite ou crie um canal com o +."
        action={
          <CreateChannelDialog
            trigger={
              <Button variant="ghost" size="sm" className="size-7 p-0 text-muted-foreground hover:text-foreground" aria-label="Criar canal" title="Criar canal">
                <Plus className="size-4" />
              </Button>
            }
          />
        }
      />
      <SidebarSection
        title="Mensagens diretas"
        channels={directs}
        loading={loading}
        error={error?.message}
        emptyTitle="Nenhuma conversa ainda"
        emptyContent="Use o + para conversar com alguém."
        action={<NewDirectMessage />}
      />
    </nav>
  );
};
