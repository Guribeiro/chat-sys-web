import { useState } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'

import { Button } from '../ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { UserAvatar } from '../user-avatar'
import { useUserSearch } from '@/hooks/use-users'
import type { WorkspaceUser } from '@/http/fetch-members'
import { cn } from '@/lib/utils'

type MembersComboboxProps = {
  /** Selected user id */
  value?: string
  onChange: (userId: string) => void
  placeholder?: string
  buttonPlaceholder?: string
  /** Users that can not be picked (e.g. already in the channel or already invited) */
  excludeIds?: string[]
  disabled?: boolean
  'aria-invalid'?: boolean
}

/** Picks a workspace user, showing avatar, name and e-mail. The search runs on the server (name or e-mail). */
export function MembersCombobox({
  value,
  onChange,
  placeholder = 'Buscar por nome ou e-mail...',
  buttonPlaceholder = 'Selecione uma pessoa',
  excludeIds = [],
  disabled,
  ...props
}: MembersComboboxProps) {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  // Results change with every search: remember who was picked to keep showing them
  const [picked, setPicked] = useState<WorkspaceUser | null>(null)
  const { users, isLoading, isError, isFetching, settled, refetch } = useUserSearch(term, { enabled: open })

  const excluded = new Set(excludeIds)
  const options = users.filter(user => !excluded.has(user.id))
  const selected = picked?.id === value ? picked : users.find(user => user.id === value)
  const searching = isFetching || !settled

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={props['aria-invalid']}
          disabled={disabled}
          className="h-10 w-full justify-between gap-2 px-3 font-normal"
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <UserAvatar name={selected.name} avatarUrl={selected.avatarUrl} className="size-6" />
              <span className="truncate">{selected.name}</span>
            </span>
          ) : (
            <span className="truncate text-muted-foreground">{buttonPlaceholder}</span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0" align="start">
        <Command shouldFilter={false}>
          <div className="relative">
            <CommandInput placeholder={placeholder} value={term} onValueChange={setTerm} />
            {searching && !isLoading && (
              <Loader2 className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Carregando pessoas...
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-2 py-6 text-sm text-muted-foreground">
                Não foi possível carregar as pessoas.
                <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>Tentar de novo</Button>
              </div>
            ) : (
              <>
                {!options.length && !searching && (
                  <CommandEmpty>
                    {users.length ? 'Quem corresponde à busca já está no canal ou foi convidado' : 'Ninguém encontrado'}
                  </CommandEmpty>
                )}
                <CommandGroup>
                  {options.map(user => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => {
                        setPicked(user)
                        onChange(user.id)
                        setOpen(false)
                      }}
                      className="gap-2"
                    >
                      <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="size-7" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{user.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                      </span>
                      <Check className={cn('size-4 shrink-0', value === user.id ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
