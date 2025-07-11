import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
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
import { Badge } from '../ui/badge'


dayjs.extend(relativeTime)

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
    socket.on('notification:new_invite', (invite: Invite) => {
      setPendingInvites((prevInvites) => [...prevInvites, invite])
    })

    return () => {
      socket.off('notification:new_invite', (invite: Invite) => {
        setPendingInvites((prevInvites) => [...prevInvites, invite])
      })
    }
  }, [])



  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          <div className='relative'>
            {pendingInvites.length > 0 && (
              <Badge className='absolute bottom-3.5 left-2' >
                {pendingInvites.length}
              </Badge>
            )}
            <UserPlus2 className="size-4" />
            <span className="sr-only">Pending invites</span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 space-y-2">


        <span className="block text-sm font-medium">
          Pending Invites ({data?.length ?? 0})
        </span>

        {isLoading && <Loader className='animate-spin' />}

        {data?.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">No invites found.</p>
        )}

        {data?.map((invite) => {
          return (
            <div key={invite.id} className="space-y-2">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  {invite.author?.name ?? 'Someone'}
                </span>{' '}
                invited you to join{' '}
                <span className="font-medium text-foreground">
                  {invite.channel.title}
                </span>{' '}
                (role: <span className='font-medium text-foreground'>{invite.role}</span>)
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
                  Accept
                </Button>

                <Button
                  onClick={() => handleRejectInvite(invite.id)}
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  <X className="mr-1.5 size-3" />
                  Reject
                </Button>
              </div>
            </div>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}