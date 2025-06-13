import { Channel } from "@/http/fetch-channels"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Hash, Users } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AdminChannelMembersList } from "./admin-channel-members-list";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react";

type AdminChannelCardProps = {
  data: Channel
}

export function AdminChannelCard({ data: channel }: AdminChannelCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Card key={channel.id} className="hover:shadow-lg transition-shadow">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
      >

        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 lg:w-10 lg:h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                <Hash className="h-3 w-3 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg capitalize">#{channel.titulo}</CardTitle>
                {channel.descricao && (
                  <p className="text-sm text-foreground/50 mt-1">{channel.descricao}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-foreground/50">
              <Users className="w-4 h-4" />
              <span>{channel.membros_count} membros</span>
            </div>
          </div>

        </CardHeader>

        <CardContent>
          <div className="flex justify-end">
            <Button asChild variant='outline' className='text-foreground'>
              <Link to={`/admin/channels/${channel.slug}/members`}>
                <Users className="w-4 h-4" />
                <p className='hidden lg:flex'>Gerenciar membros</p>
              </Link>
            </Button>
          </div>
          <CollapsibleContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Membros do canal:</h4>
              </div>
              <AdminChannelMembersList slug={channel.slug} />
            </div>
          </CollapsibleContent>
        </CardContent>
        <div className="flex justify-center py-2">
          <Button asChild variant="ghost" >
            <CollapsibleTrigger >
              {isOpen ? (
                <>
                  <span className="hidden lg:flex">Mostrar menos</span>
                  <ChevronUp />
                </>
              ) : (
                <>
                  <span className="hidden lg:flex">Mostrar mais</span>
                  <ChevronDown />
                </>
              )}
            </CollapsibleTrigger>
          </Button>
        </div>
      </Collapsible>
    </Card>
  )
}