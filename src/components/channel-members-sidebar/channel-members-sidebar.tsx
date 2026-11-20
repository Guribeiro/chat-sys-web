import { useMemo } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { fetchChannelMemebers } from '@/http/fetch-channel-members';
import { useChannel } from '@/hooks/use-channels';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { cn } from '@/lib/utils';
import { useLayout } from '@/store/layout';
import { usePresence } from '@/store/presence';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { ChannelMembersList, MemberWithConnected } from './channel-members-list';

function useChannelMembersWithPresence(slug?: string) {
  const { data, isFetching, error } = useQuery({
    queryKey: ['members', slug],
    refetchOnWindowFocus: true,
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await fetchChannelMemebers({ slug })
      return data
    },
  })

  const onlineIds = usePresence(state => state.onlineIds)

  const members = useMemo<MemberWithConnected[] | undefined>(
    () => data?.map(member => ({ ...member, connected: onlineIds.has(member.memberId) })),
    [data, onlineIds],
  )

  const errorMessage = useMemo(() => (error ? handleAxiosError(error) : undefined), [error])

  return { members, loading: isFetching, error: errorMessage }
}

/** Right-hand members panel: a column on wide screens, a sheet below xl. */
export const ChannelMembersSidebar = () => {
  const { slug } = useParams()
  const { members, loading, error } = useChannelMembersWithPresence(slug)
  const membersOpen = useLayout(state => state.membersOpen)
  const sheetOpen = useLayout(state => state.membersSheetOpen)
  const setSheetOpen = useLayout(state => state.setMembersSheetOpen)

  const { channel } = useChannel(slug)

  // A DM has two people and its header already shows the other one's presence
  if (!slug || channel?.type === 'DIRECT') return null

  const list = <ChannelMembersList data={members} error={error} loading={loading} />

  return (
    <>
      <aside
        aria-label="Membros do canal"
        className={cn(
          'hidden w-60 shrink-0 flex-col overflow-y-auto border-l px-2 py-3',
          membersOpen && 'xl:flex',
        )}
      >
        {list}
      </aside>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex w-72 flex-col gap-0 p-0 xl:hidden">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="text-base">Membros</SheetTitle>
            <SheetDescription className="sr-only">Membros deste canal e quem está online</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-2 py-3">{list}</div>
        </SheetContent>
      </Sheet>
    </>
  );
};
