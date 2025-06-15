import { Channel } from "@/http/fetch-channels"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash, Settings, Users } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

type AdminChannelCardProps = {
  data: Channel
}

export function AdminChannelCard({ data: channel }: AdminChannelCardProps) {
  return (
    <Card key={channel.id} className="bg-transparent hover:shadow-lg dark:hover:border-green-500 transition-transform hover:translate-y-[-1px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
              <Hash className="h-3 w-3 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg capitalize">#{channel.titulo}</CardTitle>
              {channel.descricao && (
                <p className="text-sm text-foreground/50 mt-1">{channel.descricao}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <div className={`w-3 h-3 rounded-full ${channel.situacao === 'ATIVO' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          </div>

        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-2 text-sm text-foreground/50">
          <Button asChild variant='ghost' className='text-foreground'>
            <Link to={`/admin/channels/${channel.slug}/members`}>
              <Users className="w-4 h-4" />
              <span>{channel.membros_count} membros</span>
            </Link>
          </Button>
          <Button asChild variant='ghost' className='text-foreground'>
            <Link to={`/admin/channels/${channel.slug}/settings`}>
              <Settings className="w-4 h-4" />
              <p className='hidden lg:flex'>Configurações</p>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}