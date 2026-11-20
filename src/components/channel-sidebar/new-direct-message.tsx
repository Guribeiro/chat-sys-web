import { useState, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { useUsers } from '@/hooks/use-users'
import { openDirectMessage } from '@/http/direct-messages'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { authSlice } from '@/store/auth'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { UserAvatar } from '../user-avatar'

/** "+" button that starts (or reopens) a 1:1 conversation with any user. */
export function NewDirectMessage({ trigger, align = 'end' }: { trigger?: ReactNode; align?: 'start' | 'center' | 'end' } = {}) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userId = authSlice(state => state.auth?.user?.id)

  const { users, isFetching } = useUsers({ enabled: open })

  const openMutation = useMutation({
    mutationFn: (peerId: string) => openDirectMessage({ userId: peerId }),
    onSuccess: ({ data }) => {
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      navigate(`/channels/${data.slug}`)
    },
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? <Button variant="ghost" size="sm" className="size-7 p-0 text-muted-foreground hover:text-foreground" aria-label="Nova conversa" title="Nova conversa">
          <Plus className="h-4 w-4" />
        </Button>}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align={align}>
        <Command>
          <CommandInput placeholder="Conversar com..." />
          <CommandList>
            <CommandEmpty>{isFetching ? 'Carregando...' : 'Ninguém encontrado'}</CommandEmpty>
            <CommandGroup>
              {users.filter(user => user.id !== userId).map(user => (
                <CommandItem
                  key={user.id}
                  value={`${user.name} ${user.email}`}
                  disabled={openMutation.isPending}
                  onSelect={() => openMutation.mutate(user.id)}
                  className="gap-2"
                >
                  <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="h-6 w-6" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{user.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                  </span>
                  {openMutation.isPending && openMutation.variables === user.id && <Loader2 className="h-4 w-4 animate-spin" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
