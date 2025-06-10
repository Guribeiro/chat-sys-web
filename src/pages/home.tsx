import { ChannelSidebar } from "@/components/channel-sidebar";
import { Outlet } from "react-router";



export const HomePage = () => {

  return (
    <div className="lg:flex gap-4 p-4">
      <aside className="lg:max-w-[238px] w-full">
        <ChannelSidebar />
      </aside>
      <main className="flex-1 mt-4 lg:mt-0">
        <Outlet />
      </main>
    </div >
  );
};

