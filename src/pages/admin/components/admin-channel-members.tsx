import { useMemo } from "react";
import { useParams } from "react-router";
import { ChannelMemberListItem } from "@/pages/admin/components/admin-channel-member-list-item";
import { Button } from "@/components/ui/button";
import { fetchChannelMemebers, Member } from "@/http/fetch-channel-members";
import { handleAxiosError } from "@/lib/axios-error-handler";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminChannelMemberForm } from "./admin-channel-member-form";
import { Skeleton } from "@/components/ui/skeleton";

type Page = {
  nextPage: number | null
  previousPage: number | null
  members: Member[]
}

export function AdminChannelMembers() {
  const { slug } = useParams()

  const { data, isFetching, error } = useQuery({
    queryKey: ['admin', 'channels', 'members', slug],
    refetchOnWindowFocus: true,
    enabled: !!slug,
    initialData: [],
    queryFn: async () => {
      const { data } = await fetchChannelMemebers({ slug, })
      return data
    },
  })

  const errorMessage = useMemo(() => {
    if (error) return handleAxiosError(error)
  }, [error])




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

  if (isFetching && !data.length) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-36" />
        <div className="space-y-2">
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="sr-only">Membros do canal</h2>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular">{data.length}</span> {data.length === 1 ? 'membro' : 'membros'}
        </p>
        <AdminChannelMemberForm memberIds={data.map(member => member.memberId)} />
      </div>

      {!data.length && !isFetching ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
          <Users className="mb-3 size-5 text-muted-foreground" />
          <p className="text-sm font-medium">Ninguém neste canal ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">Convide pessoas para começar a conversa.</p>
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border">
          {data.map((member) => (
            <ChannelMemberListItem key={member.id} data={member} />
          ))}
        </ul>
      )}
    </div>
  )
}
