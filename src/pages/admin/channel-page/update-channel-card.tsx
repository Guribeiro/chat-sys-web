import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router"
import { z } from "zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon, Loader2, Save } from "lucide-react"
import { handleAxiosError } from "@/lib/axios-error-handler"
import { toast } from "sonner"
import { Channel } from "@/http/fetch-channels"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '../../../components/ui/form';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateChannel } from "@/http/update-channel"

const channelForm = z.object({
  title: z.string().min(1, 'Adicione um titulo para o canal'),
  description: z.string().min(1, 'Adicione uma descrição para o canal'),
})

type ChannelTitleForm = z.infer<typeof channelForm>


type ChannelStatusCardProps = {
  channel: Channel
  loading: boolean
  error: string | null
}

export function UpdateChannelCard({ channel, error, loading }: ChannelStatusCardProps) {
  const { slug } = useParams()

  const navigate = useNavigate()

  const form = useForm<ChannelTitleForm>({
    defaultValues: {
      title: channel.titulo,
      description: channel.descricao
    }
  })

  const queryClient = useQueryClient()


  const updateChannelMutation = useMutation({
    mutationKey: ['admin', 'channels', slug],
    mutationFn: async ({ title, description }: ChannelTitleForm) => {
      const { data } = await updateChannel({ slug, title, description })
      return data
    },
    onSuccess: (data: Channel) => {
      form.setValue('title', data.titulo)
      form.setValue('description', data.descricao)

      toast.success('Canal atualizado com sucesso')


      if (data.slug && data.slug !== slug) {
        navigate(`/admin/channels/${data.slug}/settings`, { replace: true });
      } else {
        queryClient.invalidateQueries({ queryKey: ['admin', 'channels', slug] });
      }


    },
    onError: (error) => {
      const errorMessage = handleAxiosError(error)
      toast.error(errorMessage)
    },
  })

  function onSubmit(data: ChannelTitleForm) {
    if (form.formState.dirtyFields.title || form.formState.touchedFields.description) {
      updateChannelMutation.mutate(data)
    }
  }

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
    <Card className="bg-background flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <CardHeader>
        <CardTitle className="text-foreground text-sm lg:text-xl">Renomear canal</CardTitle>
        <CardDescription className="text-foreground/50 text-xs lg:text-base">Canais podem ser renomeados.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 lg:gap-0 lg:flex-row lg:items-center lg:space-x-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className='flex flex-col gap-0.5'>
                  <FormControl>
                    <Input
                      type="text"
                      required
                      placeholder="Exemplo: Produção"
                      defaultValue={channel.titulo}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className='flex flex-col gap-0.5'>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Sobre o que é esse canal?"
                      defaultValue={channel.descricao}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button
                type="submit"
                size="sm"
                className="flex-1 text-foreground active:bg-primary/60"
              >
                {updateChannelMutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <p className='hidden lg:flex'>Atualizar</p>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

      </CardContent>
    </Card>
  )
}