import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon, Hash, Loader2, Trash2Icon } from "lucide-react"
import { handleAxiosError } from "@/lib/axios-error-handler"
import { toast } from "sonner"
import { Channel } from "@/http/fetch-channels"

import { Button } from "@/components/ui/button"
import { deleteChannel } from "@/http/delete-channel"
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const deleteChannelForm = z.object({
  title: z.string().min(1, 'Adicione um titulo para o canal'),
})

type DeleteChannelForm = z.infer<typeof deleteChannelForm>

type ChannelStatusCardProps = {
  channel: Channel
  loading: boolean
  error: string | null
}

export function DeleteChannelCard({ channel, error, loading }: ChannelStatusCardProps) {
  const { slug } = useParams()
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate()

  const form = useForm<DeleteChannelForm>({
    resolver: zodResolver(deleteChannelForm),
  })

  const title = form.watch('title')

  const deleteChannelMutation = useMutation({
    mutationKey: ['admin', 'channels', slug],
    mutationFn: async ({ slug }: { slug: string }) => {
      const { data } = await deleteChannel({ slug })
      return data
    },
    onSuccess: () => {
      toast.success('Canal excluído com sucesso')
      handleCancelCreatingChannel()
    },
    onError: (error) => {
      const errorMessage = handleAxiosError(error)
      toast.error(errorMessage)
    },
  })

  function onSubmit() {
    deleteChannelMutation.mutate({ slug: channel.slug })
  }

  const handleCancelCreatingChannel = () => {
    setIsDialogOpen(false)
    form.reset({ title: '' })
    navigate(`/admin/channels`, { replace: true });
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
    <Card className="bg-background border-red-500 flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <CardHeader>
        <CardTitle className="text-red-500 text-sm lg:text-xl">Excluir canal</CardTitle>
        <CardDescription className="text-red-500 text-xs lg:text-base">O canal, todos os membros e mensagens serão permanentemente excluídos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent aria-describedby='create-channel-dialog' aria-description='Adicionar membro'>
            <DialogHeader>
              <DialogTitle>Deseja mesmo excluir o canal?</DialogTitle>
              <DialogDescription>
                <Card className="mt-2">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                        <Hash className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">#{channel.title}</CardTitle>
                        {channel.description && (
                          <p className="text-sm text-foreground/50 mt-1">{channel.description}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </DialogDescription>
            </DialogHeader>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
                  <p className="text-sm text-foreground/50">Para confirmar, digite o nome do canal "{channel.slug}"</p>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className='flex w-full flex-col gap-0.5'>
                        <FormControl>
                          <Input
                            type="text"
                            required
                            className="focus-visible:ring-0 focus:border-red-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-500 hover:text-red-500"
                    disabled={title !== channel.slug}
                    type="submit"
                  >
                    {deleteChannelMutation.isPending ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : 'Excluir este canal'}
                  </Button>
                </form>
              </Form>
            )}

          </DialogContent>
          <div className="flex space-x-2">
            <DialogTrigger asChild>
              <Button
                type="submit"
                size="sm"
                variant="destructive"
                className="flex-1 text-foreground"
              >
                <Trash2Icon className="w-4 h-4" />
                <p className='hidden lg:flex'>Excluir</p>
              </Button>
            </DialogTrigger>
          </div>
        </Dialog>

      </CardContent>
    </Card>
  )
}