import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChannelForm } from './channel-form';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { ChevronDown, ChevronUp, Hash } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useQuery } from '@tanstack/react-query';
import { fetchChannels } from '@/http/fetch-channels';
import { authSlice } from '@/store/auth';
import { ChannelList } from './channel-list';

export const ChannelSidebar = () => {
  const { auth } = authSlice(state => state)
  const [collapsed, setCollapsed] = useState(false)

  const { data, isFetching, error } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data } = await fetchChannels()
      return data
    },
  })

  return (
    <Card className="h-fit">
      <Collapsible
        open={collapsed}
        onOpenChange={setCollapsed}
      >
        <CardHeader >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-foreground truncate">Canais</span>
            </div>
            <div className='flex items-center gap-2'>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              {auth.user.admin && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <ChannelForm />
                </>
              )}
            </div>

          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-1">
            <ChannelList channels={data} error={error?.message} loading={isFetching} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card >
  );
};

