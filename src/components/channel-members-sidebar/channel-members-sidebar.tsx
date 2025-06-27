import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card';

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '../ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  Users2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchChannelMemebers } from '@/http/fetch-channel-members';

import { ChannelMembersList, ConnectedUser, MemberWithConnected } from './channel-members-list';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { socket } from '@/socket';

export const ChannelMembersSidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { slug } = useParams()

  const { data, isFetching, error } = useQuery({
    queryKey: ['members', slug],
    refetchOnWindowFocus: true,
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await fetchChannelMemebers({ slug })
      return data
    },
  })


  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])

  const members = useMemo<MemberWithConnected[] | undefined>(() => {
    if (!data) return undefined;

    const connectedUserIds = new Set(connectedUsers.map(user => user.user.id));

    return data.map(member => ({
      ...member,
      connected: connectedUserIds.has(member.memberId),
    }));
  }, [data, connectedUsers]);

  useEffect(() => {
    socket.on('user:list_updated', (data: ConnectedUser[]) => {
      console.log({ data })
      setConnectedUsers(data)
    })

    return () => {
      socket.off('user:list_updated', (data: ConnectedUser[]) => {
        setConnectedUsers(data)
      })
    }
  }, [connectedUsers])


  const errorMessage = useMemo(() => {
    if (error) return handleAxiosError(error)
  }, [error])


  if (!slug) return null


  return (
    <Card className="h-fit">
      <Collapsible
        open={collapsed}
        onOpenChange={setCollapsed}
      >
        <CardHeader >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-foreground truncate ">Membros ({data?.length})</span>
            </div>
            <div className='flex items-center gap-2'>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>

            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className=" space-y-1">
            <ChannelMembersList data={members} error={errorMessage} loading={isFetching} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card >
  );
};

