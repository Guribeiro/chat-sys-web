import { ChannelSidebar } from "@/components/channel-sidebar/channel-sidebar";
import { ChannelMembersSidebar } from "@/components/channel-members-sidebar/channel-members-sidebar";
import { Outlet, useParams } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Hash } from "lucide-react";

import { socket } from '@/socket'
import { useEffect, useState } from "react";
import { authSlice } from "@/store/auth";


export function ChannelsPage() {
  const { auth } = authSlice(state => state)
  const { slug } = useParams()
  const [isConnected, setIsConnected] = useState(false)

  function onDisconnect() {
    setIsConnected(false);
  }

  useEffect(() => {
    if (!socket.connected) {
      socket.connect(); // Explicitly connect when component mounts
    }

    function onConnect() {
      console.log('Socket connected!'); // For debugging
      setIsConnected(true);
      // Ensure auth.user is not null/undefined before emitting
      if (auth.user) {
        socket.emit('user_connected', auth.user);
        console.log({ user_connected: auth.user })
      } else {
        console.warn('auth.user is not available when socket connected.');
        // Handle case where user data isn't ready (e.g., redirect to login)
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    }
  }, [auth.user])

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
              <h2 className="text-md lg:text-xl font-semibold text-foreground mb-2">Bem vindo(a) ao Canal de Comunicação da <span className="text-primary">Realtime chat</span></h2>
              <p className="text-muted-foreground">Selecione um canal para começar a conversar!</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div >
  )
}