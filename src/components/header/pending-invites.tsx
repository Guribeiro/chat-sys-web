import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/pt-br'
import { Check, Loader, UserPlus2, X } from 'lucide-react'

import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getPendingInvites, Invite } from '@/http/get-pending-invites'
import { useParams } from 'react-router'
import { acceptInvite } from '@/http/accept-invite'
import { rejectInvite } from '@/http/reject-invite'
import { toast } from 'sonner'
import { socket } from '@/socket';


dayjs.extend(relativeTime)
dayjs.locale('pt-br')

type InviteActionPayload = {
  inviteId: string;
  action: 'accept' | 'reject'; // 'accept' or 'reject'
};


export function PendingInvites() {
  const { slug } = useParams()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pending-invites'],
    initialData: [],
    queryFn: async () => {
      const { data } = await getPendingInvites()

      return data
    },
    enabled: isOpen,
  })


  const handleInviteActionMutation = useMutation({
    mutationKey: ['invite-action'],
    mutationFn: async ({ inviteId, action }: InviteActionPayload) => {
      if (action === 'accept') {
        return await acceptInvite({ inviteId })
      } else {
        return await rejectInvite({ inviteId })
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] })

      if (variables.action === 'accept') {
        toast.success('Convite aceito com sucesso!')
        queryClient.invalidateQueries({ queryKey: ['members', slug] })
        queryClient.invalidateQueries({ queryKey: ['channels'] })

      } else {
        toast.success('Convite recusado com sucesso!')
      }


      if (data?.length === 1) {
        setIsOpen(false);
      }
    },
    onError: (error, variables) => {
      const actionVerb = variables.action === 'accept' ? 'aceitar' : 'recusar'
      const errorMessage = `Erro ao ${actionVerb} convite.`


      toast.error(errorMessage)
      console.error(`Error ${variables.action}ing invite for ${variables.inviteId}:`, error)
    },

  })

  async function handleAcceptInvite(inviteId: string) {
    handleInviteActionMutation.mutate({ inviteId, action: 'accept' })
  }

  async function handleRejectInvite(inviteId: string) {
    handleInviteActionMutation.mutate({ inviteId, action: 'reject' })
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    setPendingInvites([])
  }


  useEffect(() => {
    const handleNewInvite = ({ invite }: { invite: Invite }) => {
      setPendingInvites((prevInvites) =>
        prevInvites.some(item => item.id === invite.id) ? prevInvites : [...prevInvites, invite]
      )
    }

    socket.on('notification:new_invite', handleNewInvite)

    return () => {
      socket.off('notification:new_invite', handleNewInvite)
    }
  }, [])



  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="relative text-muted-foreground hover:text-foreground" title="Convites">
          <UserPlus2 className="size-4" />
          {pendingInvites.length > 0 && (
            <span className="absolute right-1 top-1 min-w-4 rounded-full bg-unread px-1 text-[10px] font-semibold leading-4 text-unread-foreground tabular">
              {pendingInvites.length}
            </span>
          )}
          <span className="sr-only">Convites pendentes</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 space-y-2">


        <span className="block text-sm font-semibold">
          Convites pendentes {!!data?.length && <span className="font-normal text-muted-foreground tabular">· {data.length}</span>}
        </span>

        {isLoading && <Loader className='size-4 animate-spin text-muted-foreground' />}

        {data?.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">Nenhum convite por enquanto. Quando alguém te chamar para um canal, ele aparece aqui.</p>
        )}

        {data?.map((invite) => {
          return (
            <div key={invite.id} className="space-y-2">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  {invite.author?.name ?? 'Alguém'}
                </span>{' '}
                convidou você para{' '}
                <span className="font-medium text-foreground">
                  #{invite.channel.title}
                </span>{' '}
                como <span className='font-medium text-foreground'>{invite.role === 'ADMIN' ? 'administrador' : 'membro'}</span>
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {dayjs(invite.createdAt).fromNow()}
              </p>

              <div className="flex gap-1">
                <Button
                  onClick={() => handleAcceptInvite(invite.id)}
                  size="sm"
                  variant="outline"
                >
                  <Check className="mr-1.5 size-3" />
                  Aceitar
                </Button>

                <Button
                  onClick={() => handleRejectInvite(invite.id)}
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  <X className="mr-1.5 size-3" />
                  Recusar
                </Button>
              </div>
            </div>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}