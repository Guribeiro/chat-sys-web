import { Member } from "@/http/fetch-channel-members"
import { EmptyIndicator } from "../empty-indicator"
import { useParams } from "react-router"
import { Loader2, AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMemberFromChannel } from "@/http/remove-member-from-channel";
import { toast } from "sonner";
import { authSlice } from "@/store/auth";
import { handleAxiosError } from "@/lib/axios-error-handler";

type ChannelMembersListProps = {
  data: Member[]
  loading?: boolean
  error?: string
}

export function ChannelMembersList({ data, error, loading }: ChannelMembersListProps) {
  const { slug } = useParams()
  const { auth } = authSlice(state => state)

  const queryClient = useQueryClient()

  const removeMemberFromChannelMutation = useMutation({
    mutationKey: ['members', slug],
    mutationFn: async ({ member_id }: { member_id: number }) => {
      const { data } = await removeMemberFromChannel({ slug, member_id })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', slug] });
      toast.success('Membro adicionado com sucesso')
    },
    onError: (error) => {
      const errorMessage = handleAxiosError(error)
      toast.error(errorMessage)
    },
  })

  if (loading) {
    return <div className="flex items-center justify-center bg-opacity-50 rounded-md cursor-not-allowed">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
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
    <ul className='overflow-y-scroll max-h-96 no-scrollbar gap-2 flex flex-col'>
      {!data?.length && !loading && <EmptyIndicator title='Não há canais por aqui' />}
      {data?.map(member => (
        <li
          key={member.id}
          className={`group border-2 border-transparent hover:border-green-500 w-full text-left p-2 rounded-lg transition-colors hover:bg-background/60 text-foreground cursor-pointer`}
        >
          <Dialog>
            <form>
              <DialogTrigger asChild>
                <div className={`flex items-center space-x-2 text-sm}`}>
                  <div className='flex flex-1 items-center space-x-2'>
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.usuario_nome}`}
                      alt={member.usuario_nome}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    />
                    <span className='truncate'>{member.usuario_nome}</span>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Remover do canal</DialogTitle>
                  <DialogDescription>
                    Deseja mesmo <span className='text-red-500 font-medium'>remover</span> o membro <strong>{member.usuario_nome}</strong> do canal ?
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant='destructive'
                    type="submit"
                    disabled={removeMemberFromChannelMutation.isPending || auth.user.id === member.usuario_id}
                    onClick={() => removeMemberFromChannelMutation.mutate({ member_id: member.id })}
                  >
                    {removeMemberFromChannelMutation.isPending ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      'Remover membro'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>

        </li>
      ))}
    </ul>
  )
}