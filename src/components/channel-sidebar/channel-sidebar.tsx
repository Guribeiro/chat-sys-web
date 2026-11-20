import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { ChevronDown, ChevronUp, Hash, MessagesSquare } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { Channel, fetchChannels } from '@/http/fetch-channels';
import { socket } from '@/socket';
import { authSlice } from '@/store/auth';
import { ChannelList } from './channel-list';
import { NewDirectMessage } from './new-direct-message';

type SectionProps = {
  icon: ReactNode
  title: string
  channels: Channel[] | undefined
  loading: boolean
  error?: string
  emptyTitle: string
  action?: ReactNode
}

function SidebarSection({ icon, title, channels, loading, error, emptyTitle, action }: SectionProps) {
  // Named "open" for real now: the list starts expanded
  const [open, setOpen] = useState(true)
  const totalUnread = channels?.reduce((total, channel) => total + (channel.unreadCount ?? 0), 0) ?? 0

  return (
    <Card className="h-fit">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {icon}
              <span className="text-sm font-medium text-foreground truncate">{title}</span>
              {!open && totalUnread > 0 && (
                <span className="rounded-full bg-green-600 px-1.5 text-[10px] font-semibold leading-4 text-white">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </div>
            <div className='flex items-center gap-1'>
              {action}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={open ? `Recolher ${title}` : `Expandir ${title}`}>
                  {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-1">
            <ChannelList channels={channels} error={error} loading={loading} emptyTitle={emptyTitle} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export const ChannelSidebar = () => {
  const { slug } = useParams()
  const queryClient = useQueryClient()
  const userId = authSlice(state => state.auth?.user?.id)

  const { data, isFetching, error } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data } = await fetchChannels({ status: 'active' })
      return data
    },
  })

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
    <>
      <SidebarSection
        icon={<Hash className="w-4 h-4 text-green-500" />}
        title="Canais"
        channels={groups}
        loading={loading}
        error={error?.message}
        emptyTitle="Não há canais por aqui"
      />
      <SidebarSection
        icon={<MessagesSquare className="w-4 h-4 text-green-500" />}
        title="Mensagens diretas"
        channels={directs}
        loading={loading}
        error={error?.message}
        emptyTitle="Nenhuma conversa ainda"
        action={<NewDirectMessage />}
      />
    </>
  );
};
