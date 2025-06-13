import { ChevronDown, LogOut } from 'lucide-react'

import { Avatar, AvatarFallback } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { authSlice } from '@/store/auth'
import { Button } from './ui/button'
import { AvatarImage } from '@radix-ui/react-avatar'

function getInitials(name: string): string {
  const initials = name
    ?.split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  return initials
}

export function ProfileButton() {
  const { auth, signout } = authSlice(state => state)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 outline-none">
        {auth?.user && (
          <Avatar className='w-8 h-8' >
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user.name}`} alt={auth.user.name} />
            <AvatarFallback>{getInitials(auth.user.name)}</AvatarFallback>
          </Avatar>
        )}
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Button variant='destructive' className='w-full' onClick={signout}>
            <LogOut className="mr-2 size-4" />
            Sair
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}