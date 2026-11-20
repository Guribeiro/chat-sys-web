import { ModeToggle } from '@/components/mode-toggle';
import { Separator } from '@/components/ui/separator';
import { ProfileButton } from '@/components/profile-button';
import { Button } from '../ui/button';
import { Link } from 'react-router';
import { User } from 'lucide-react';

import { PendingInvites } from './pending-invites';
import { SearchPalette } from '../search/search-palette';

export const Header = () => {
  return (
    <header className="flex items-center justify-between py-4">
      {/* <img src={logo} className='w-28 lg:w-44' /> */}
      <span className='text-muted-foreground text-2xl font-medium'>Realtime chat</span>
      <div className='flex items-center gap-2'>
        <SearchPalette />
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