import { removeMemberFromChannel } from "@/http/remove-member-from-channel"
import { Member } from "@/http/fetch-channel-members"
import { handleAxiosError } from "@/lib/axios-error-handler"
import { authSlice } from "@/store/auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { toast } from "sonner"

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
import { Button } from "../../../components/ui/button";
import { Crown, Loader2 } from "lucide-react"


type ChannelMemberListItemProps = {
  data: Member
}

export function ChannelMemberListItem({ data: member }: ChannelMemberListItemProps) {
  const { slug } = useParams()

  const { auth } = authSlice(state => state)

  const queryClient = useQueryClient()

  const removeMemberFromChannelMutation = useMutation({
    mutationKey: ['admin', 'channels', 'members', slug],
    mutationFn: async ({ member_id }: { member_id: number }) => {
      const { data } = await removeMemberFromChannel({ slug, member_id })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels', 'members', slug] });
      toast.success('Membro removido com sucesso')
    },
    onError: (error) => {
      const errorMessage = handleAxiosError(error)
      toast.error(errorMessage)
    },
  })
  return (
    <li
      key={member.id}
      className={`group border-1 border-foreground/10 hover:border-green-500 w-full text-left p-2 rounded-lg transition-colors hover:bg-background/60 text-foreground cursor-pointer`}
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
                <span className={`truncate capitalize ${auth.user.id === member.usuario_id ? 'text-green-500 animate-pulse' : ''}`}>{member.usuario_nome}</span>
              </div>
              {member.usuario_adm === 'SIM' && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Remover do canal</DialogTitle>
              {auth.user.id === member.usuario_id || member.usuario_adm === 'SIM' ? (
                <DialogDescription>
                  Você não tem permissão para <span className='text-red-500 font-medium'>remover</span> este membro
                </DialogDescription>
              ) : (
                <DialogDescription>
                  Deseja mesmo <span className='text-red-500 font-medium'>remover</span> <strong>{member.usuario_nome}</strong> do canal ?
                </DialogDescription>
              )}
            </DialogHeader>

            <DialogFooter className="flex flex-col gap-2 lg:gap-0">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant='destructive'
                type="submit"
                disabled={removeMemberFromChannelMutation.isPending || auth.user.id === member.usuario_id || member.usuario_adm === 'SIM'}
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
  )
}