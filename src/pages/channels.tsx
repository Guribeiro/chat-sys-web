import { ChannelSidebar } from "@/components/channel-sidebar/channel-sidebar";
import { ChannelMembersSidebar } from "@/components/channel-members-sidebar/channel-members-sidebar";
import { Outlet, useParams } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Hash } from "lucide-react";

export function ChannelsPage() {
  const { slug } = useParams()

  return (
    <div className="lg:flex gap-4">
      <aside className="flex flex-col gap-2 lg:max-w-[238px] w-full">
        <ChannelSidebar />
        <ChannelMembersSidebar />
      </aside>
      <main className="flex-1 mt-4 lg:mt-0">
        {slug ? (
          <Outlet />
        ) : (
          <Card className="flex justify-center items-center h-[600px]">
            <CardContent className="text-center">
              <Hash className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-md lg:text-xl font-semibold text-foreground mb-2">Bem vindo(a) ao Canal de Comunicação da <span className="text-primary">Sorocaps</span></h2>
              <p className="text-muted-foreground">Selecione um canal para começar a conversar!</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div >
  )
}