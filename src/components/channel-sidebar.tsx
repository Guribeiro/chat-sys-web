import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChannelForm } from '@/components/channel-form';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { AlertCircleIcon, ChevronDown, ChevronUp, Hash, Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { useQuery } from '@tanstack/react-query';
import { fetchChannels } from '@/http/fetch-channels';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { authSlice } from '@/store/auth';
import { useNavigate, useParams } from 'react-router';

import { Link } from 'react-router';


export const ChannelSidebar = () => {
  const { auth } = authSlice(state => state)
  const [collapsed, setCollapsed] = useState(false)
  const { channelId } = useParams()

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
              <span className="font-medium text-foreground">Canais</span>
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
            {error && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>{'erro'}</AlertTitle>
                <AlertDescription>
                  <p>{'algo deu errado'}</p>
                </AlertDescription>
              </Alert>
            )}
            {isFetching && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 rounded-md cursor-not-allowed">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            {data?.map(channel => (
              <Link
                to={`/${channel.id}`}
                key={channel.id}
              >
                <button
                  className={`w-full text-left p-2 rounded-lg transition-colors hover:bg-background/60 text-foreground cursor-pointer`}
                >
                  <div className={`flex items-center space-x-2 text-sm ${Number(channelId) === channel.id ? 'text-green-500' : 'font-normal'}`}>
                    <Hash className="w-4 h-4" />
                    <span >{channel.titulo}</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-6 mt-1 truncate">{channel.descricao}</p>
                </button>
              </Link>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card >
  );
};

