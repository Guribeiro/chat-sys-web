import { Combobox, ComboboxOption } from "@/components/combobox"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { slugToOriginalText } from "@/lib/utils"
import { Controller, useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { z } from "zod"
import { fetchChannel } from "@/http/fetch-channel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon, Loader2 } from "lucide-react"
import { handleAxiosError } from "@/lib/axios-error-handler"
import { useEffect, useMemo } from "react"
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


export function ChannelStatusCard() {
  const { slug } = useParams()
  const form = useForm<ChannelStatusForm>()

  const queryClient = useQueryClient()

  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'channels', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await fetchChannel({ slug })
      return data
    },
  })


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

  const errorMessage = useMemo(() => {
    if (error) return handleAxiosError(error)
  }, [error])


  if (isPending) {
    return (
      <h1>Carregando...</h1>
    )
  }

  if (error) {
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


  return (
    <Card className="bg-background flex items-center justify-between">
      <CardHeader>
        <CardTitle className="text-foreground text-sm lg:text-xl">Alterar visibilidade do canal</CardTitle>
        <CardDescription className="text-foreground/50 text-xs lg:text-base">Canais inativos ficam invisíveis para todos.</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending || updateChannelStatusMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <form >
            <Controller
              name="status"
              control={form.control}
              defaultValue={data.situacao}
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
        )}

      </CardContent>
    </Card>
  )
}