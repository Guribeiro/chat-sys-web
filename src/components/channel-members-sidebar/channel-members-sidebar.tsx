import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card';
import { ChannelMemberForm } from './channel-member-form';

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '../ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  Users2,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchChannelMemebers, Member } from '@/http/fetch-channel-members';

import { authSlice } from '@/store/auth';
import { ChannelMembersList } from './channel-members-list';

type Page = {
  nextPage: number | null
  previousPage: number | null
  members: Member[]
}

export const ChannelMembersSidebar = () => {
  const { auth } = authSlice(state => state)
  const [collapsed, setCollapsed] = useState(false)
  const { slug } = useParams()

  const { data, isFetching, error, fetchNextPage } = useInfiniteQuery({
    queryKey: ['members', slug],
    refetchOnWindowFocus: true,
    enabled: !!slug,
    initialData: {
      pages: [],
      pageParams: [],
    },
    getNextPageParam: (lastPage: Page) => {
      if (lastPage.nextPage) return lastPage.nextPage
      return lastPage.previousPage
    },
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await fetchChannelMemebers({ slug, page: pageParam })
      return data
    },
  })

  const members = useMemo(() => {
    return data?.pages.flatMap(page => page.members).reverse().map(member => {
      const [firstName, middleName] = member.usuario_nome.split(' ')

      return {
        ...member,
        usuario_nome: `${firstName} ${middleName}`
      }
    }) || [];
  }, [data?.pages])

  const lastPage = data.pages[data.pages.length - 1]

  if (!slug) return null

  return (
    <Card className="h-fit">
      <Collapsible
        open={collapsed}
        onOpenChange={setCollapsed}
      >
        <CardHeader >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-foreground truncate ">Membros ({members.length})</span>
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
                  <ChannelMemberForm />
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className=" space-y-1">
            <ChannelMembersList data={members} error={error?.message} loading={isFetching} />
            <div className='flex items-center w-full justify-center'>
              {lastPage?.nextPage && (
                <Button
                  variant='outline'
                  onClick={() => fetchNextPage()}
                  className='shadow-sm'
                >
                  Carregar mais
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card >
  );
};

