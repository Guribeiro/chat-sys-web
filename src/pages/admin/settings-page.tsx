import { useMemo } from "react";
import { ChannelStatusCard } from "./channel-page/channel-status-card";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { fetchChannel } from "@/http/fetch-channel";
import { handleAxiosError } from "@/lib/axios-error-handler";
import { UpdateChannelCard } from "./channel-page/update-channel-card";
import { DeleteChannelCard } from "./channel-page/delete-channel-card";

export function ChannelSettingsPage() {
  const { slug } = useParams()

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'channels', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await fetchChannel({ slug })
      return data
    },
  })


  const errorMessage = useMemo(() => {
    if (error) return handleAxiosError(error)
  }, [error])


  if (isPending) {
    return (
      <h1>Carregando...</h1>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold">Configurações do canal</h3>
      <div className="space-y-2">
        <ChannelStatusCard channel={data} loading={isPending} error={errorMessage} />
        <UpdateChannelCard channel={data} loading={isPending} error={errorMessage} />
        <DeleteChannelCard channel={data} loading={isPending} error={errorMessage} />
      </div>
    </div>
  )
}