import { ChannelSidebar } from "@/components/channel-sidebar/channel-sidebar";
import { ChannelMembersSidebar } from "@/components/channel-members-sidebar/channel-members-sidebar";
import { Outlet } from "react-router";
import { Chat } from "@/components/chat";

export function ChannelsPage() {

  return (
    <div className="lg:flex gap-4">
      <aside className="flex flex-col gap-2 lg:max-w-[238px] w-full">
        <ChannelSidebar />
        <ChannelMembersSidebar />
      </aside>
      <main className="flex-1 mt-4 lg:mt-0">
        <Outlet />
      </main>
    </div >
  )
}