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
      <DropdownMenuTrigger className="flex items-center gap-3 outline-none" aria-label="Menu do perfil">
        {auth?.user && (
          <UserAvatar
            name={auth.user.name}
            avatarUrl={auth.user.avatarUrl}
            className={`border-2 ${isOnline ? 'border-green-500' : 'border-red-500'}`}
          />
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
