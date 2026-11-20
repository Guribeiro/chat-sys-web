import { Outlet, useMatch, useParams } from "react-router";
import { Hash, MessageSquarePlus, Search } from "lucide-react";

import { ChannelSidebar } from "@/components/channel-sidebar/channel-sidebar";
import { NewDirectMessage } from "@/components/channel-sidebar/new-direct-message";
import { CreateChannelDialog } from "@/components/channel-manage/create-channel-dialog";
import { ChannelMembersSidebar } from "@/components/channel-members-sidebar/channel-members-sidebar";
import { ActivityNotifier } from "@/components/activity/activity-notifier";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authSlice } from "@/store/auth";
import { useLayout } from "@/store/layout";
import { SEARCH_SHORTCUT } from "@/lib/platform";

function NoChannelSelected() {
  const name = authSlice(state => state.auth?.user?.name)
  const firstName = name?.split(' ')[0]
  const openSearch = useLayout(state => state.setSearchOpen)

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <BrandMark className="mb-5 size-12" />
        <h1 className="text-xl font-semibold tracking-tight text-balance">
          {firstName ? `Olá, ${firstName}. Por onde começamos?` : 'Por onde começamos?'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-balance">
          Escolha um canal ou conversa na lista ao lado, ou comece algo novo.
        </p>
        <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <NewDirectMessage
            align="center"
            trigger={
              <Button>
                <MessageSquarePlus className="size-4" />
                Nova conversa
              </Button>
            }
          />
          <CreateChannelDialog
            trigger={
              <Button variant="outline">
                <Hash className="size-4" />
                Criar canal
              </Button>
            }
          />
        </div>
        <button
          type="button"
          onClick={() => openSearch(true)}
          className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Search className="size-3.5" />
          Buscar em todas as mensagens
          <kbd className="ml-1 rounded border bg-muted px-1 font-mono text-[10px]">{SEARCH_SHORTCUT}</kbd>
        </button>
      </div>
    </div>
  )
}

export function ChannelsPage() {
  const { slug } = useParams()
  const managing = !!useMatch('/channels/:slug/manage/*')

  return (
    <div className="flex h-full">
      <ActivityNotifier />
      {/* Narrow screens show either the list or the open conversation */}
      <aside
        className={cn(
          'w-full shrink-0 border-r bg-sidebar lg:block lg:w-64',
          slug && 'hidden',
        )}
      >
        <ChannelSidebar />
      </aside>
      <section className={cn('min-w-0 flex-1', !slug && 'hidden lg:block')}>
        {slug ? <Outlet /> : <NoChannelSelected />}
      </section>
      {slug && !managing && <ChannelMembersSidebar />}
    </div>
  )
}
