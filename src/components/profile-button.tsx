import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { Link } from 'react-router'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { authSlice } from '@/store/auth'
import { usePresence } from '@/store/presence'
import { UserAvatar } from './user-avatar'

export function ProfileButton() {
  const { auth, signout } = authSlice(state => state)
  const isOnline = usePresence(state => state.isOnline(auth?.user?.id))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="Menu do perfil">
        {auth?.user && (
          <span className="relative">
            <UserAvatar name={auth.user.name} avatarUrl={auth.user.avatarUrl} />
            <span
              className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background ${isOnline ? 'bg-online' : 'bg-muted-foreground/50'}`}
              title={isOnline ? 'Conectado' : 'Reconectando...'}
            />
          </span>
        )}
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{auth?.user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{auth?.user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserRound className="mr-2 size-4" />
            Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={signout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
