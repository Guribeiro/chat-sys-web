import { ModeToggle } from '@/components/mode-toggle';
import logo from '@/assets/logo.png'
import { Separator } from '@/components/ui/separator';
import { ProfileButton } from '@/components/profile-button';
import { authSlice } from '@/store/auth';
import { Button } from '../ui/button';
import { Link } from 'react-router';
import { User } from 'lucide-react';

import { PendingInvites } from './pending-invites';

export const Header = () => {
  const { auth } = authSlice(state => state)
  return (
    <header className="flex items-center justify-between py-4">
      {/* <img src={logo} className='w-28 lg:w-44' /> */}
      <span className='text-muted-foreground text-2xl font-medium'>Realtime chat</span>
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          <Button variant='outline' asChild>
            <Link to='/admin/channels'>
              <User className="w-4 h-4" />
              <span className='text-foreground hidden lg:flex'>
                Admin
              </span>
            </Link>
          </Button>
        </div>
        <PendingInvites />
        <Separator orientation="vertical" className="h-5" />
        <ModeToggle />
        <Separator orientation="vertical" className="h-5" />
        <ProfileButton />
      </div>
    </header>
  )
}