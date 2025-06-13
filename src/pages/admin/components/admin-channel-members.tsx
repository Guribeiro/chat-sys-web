import { ChannelMemberListItem } from "@/pages/admin/components/admin-channel-member-list-item";
import { Button } from "@/components/ui/button";
import { fetchChannelMemebers, Member } from "@/http/fetch-channel-members";
import { Channel } from "@/http/fetch-channels";
import { handleAxiosError } from "@/lib/axios-error-handler";
import { authSlice } from "@/store/auth";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircleIcon, ArrowLeft, Divide, Loader2, Users, X } from "lucide-react";
import { useMemo } from "react";
import { Link, Outlet, useParams } from "react-router";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from "@/components/ui/card";

type Page = {
  nextPage: number | null
  previousPage: number | null
  members: Member[]
}

export function AdminChannelMembers() {
  const { slug } = useParams()

  const { data, isFetching, error, fetchNextPage } = useInfiniteQuery({
    queryKey: ['admin', 'channels', 'members', slug],
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

  const errorMessage = useMemo(() => {
    if (error) return handleAxiosError(error)
  }, [error])

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

  if (isFetching && !members.length) {
    return <div className="flex items-center justify-center bg-opacity-50 rounded-md cursor-not-allowed">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  }

  if (errorMessage) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          <p>{errorMessage}</p>
        </AlertDescription>
      </Alert>
    )
  }

  if (!members.length && !isFetching) {
    return (
      <div className="text-center py-8 text-foreground/50">
        <Users className="w-6 h-6 text-text-foreground/50 mx-auto mb-3" />
        <p>Não há membros no canal</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Outlet />
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((member) => (
          <ChannelMemberListItem key={member.id} data={member} />
        ))}
      </ul>
      <div className="flex justify-center">
        {lastPage?.nextPage && (
          <Button
            variant='outline'
            onClick={() => fetchNextPage()}
            className='shadow-sm'
          >
            Carregar mais membros
          </Button>
        )}
      </div>
    </div>
  )
}