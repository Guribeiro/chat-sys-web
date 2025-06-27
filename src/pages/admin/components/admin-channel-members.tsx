import { useMemo } from "react";
import { useParams } from "react-router";
import { ChannelMemberListItem } from "@/pages/admin/components/admin-channel-member-list-item";
import { Button } from "@/components/ui/button";
import { fetchChannelMemebers, Member } from "@/http/fetch-channel-members";
import { handleAxiosError } from "@/lib/axios-error-handler";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex items-baseline justify-between">
        <h3 className="text-xl font-semibold">Membros do canal</h3>
      </div>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="flex items-baseline justify-between text-foreground text-sm lg:text-xl">
            <span className="flex-1">Adicionar membro</span>
            <AdminChannelMemberForm />
          </CardTitle>
          <CardDescription className="text-foreground/50 text-xs lg:text-base">Gerencie os membros do canal</CardDescription>
        </CardHeader>
        <CardContent>
          {!data.length && !isFetching && (
            <div className="text-center py-8 text-foreground/50">
              <Users className="w-6 h-6 text-text-foreground/50 mx-auto mb-3" />
              <p>Não há membros no canal</p>
            </div>
          )}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map((member) => (
              <ChannelMemberListItem key={member.id} data={member} />
            ))}
          </ul>
        </CardContent>
      </Card >
    </div >
  )
}