import { Combobox, ComboboxOption } from "@/components/combobox"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Controller, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { z } from "zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon, Loader2 } from "lucide-react"
import { handleAxiosError } from "@/lib/axios-error-handler"
import { toast } from "sonner"
import { updateChannelStatus } from "@/http/update-channel-status"
import { Channel } from "@/http/fetch-channels"

const statusOptions: ComboboxOption[] = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Inativo' },
]

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
      form.setValue('status', data.situacao)
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


  return (
    <Card className="bg-background flex flex-col justify-center lg:flex-row lg:items-center lg:justify-between">
      <CardHeader>
        <CardTitle className="text-foreground text-sm lg:text-xl">Alterar visibilidade do canal</CardTitle>
        <CardDescription className="text-foreground/50 text-xs lg:text-base">Canais inativos ficam invisíveis para todos.</CardDescription>
      </CardHeader>
      <CardContent >
        {loading || updateChannelStatusMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${channel.situacao === 'ATIVO' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <form  >
              <Controller
                name="status"
                control={form.control}
                defaultValue={channel.situacao}
                render={({ field }) => (
                  <Combobox
                    placeholder="Filtrar status"
                    buttonPlaceholder="Status"
                    options={statusOptions}
                    {...field}
                    onChange={status => updateChannelStatusMutation.mutate({ status: status as ChannelStatusForm['status'] })}
                  />
                )}
              />
            </form>
          </div>
        )}

      </CardContent>
    </Card>
  )
}