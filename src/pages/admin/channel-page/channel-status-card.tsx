import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
} from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { z } from "zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon, Loader2 } from "lucide-react"
import { handleAxiosError } from "@/lib/axios-error-handler"
import { toast } from "sonner"
import { updateChannelStatus } from "@/http/update-channel-status"
import { Channel } from "@/http/fetch-channels"

const channelStatusForm = z.object({
  status: z.enum(['ATIVO', 'INATIVO']),
})

type ChannelStatusForm = z.infer<typeof channelStatusForm>


type ChannelStatusCardProps = {
  channel: Channel
  loading: boolean
  error: string | null
}

export function ChannelStatusCard({ channel, error, loading }: ChannelStatusCardProps) {
  const { slug } = useParams()
  const form = useForm<ChannelStatusForm>()

  const queryClient = useQueryClient()

  const updateChannelStatusMutation = useMutation({
    mutationKey: ['admin', 'channels', slug],
    mutationFn: async ({ status }: ChannelStatusForm) => {
      const { data } = await updateChannelStatus({ slug, status })
      return data
    },
    onSuccess: (data: Channel) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels', slug], });
      form.setValue('status', data.active ? 'ATIVO' : 'INATIVO')
      toast.success('Canal atualizado com sucesso')
    },
    onError: (error) => {
      const errorMessage = handleAxiosError(error)
      toast.error(errorMessage)
    },
  })


  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          <p>{error}</p>
        </AlertDescription>
      </Alert>
    )
  }


  const pending = loading || updateChannelStatusMutation.isPending

  return (
    <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Label htmlFor="channel-active" className="text-base font-semibold">Canal ativo</Label>
        <p className="text-sm text-muted-foreground">
          Canais inativos somem da lista de todos os membros até serem reativados.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <span className="text-sm text-muted-foreground">{channel.active ? 'Ativo' : 'Inativo'}</span>
        <Switch
          id="channel-active"
          checked={channel.active}
          disabled={pending}
          onCheckedChange={(checked) => updateChannelStatusMutation.mutate({ status: checked ? 'ATIVO' : 'INATIVO' })}
        />
      </div>
    </Card>
  )
}
