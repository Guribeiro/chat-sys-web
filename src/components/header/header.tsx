import { ModeToggle } from '@/components/mode-toggle';
import logo from '@/assets/logo.png'
import { Separator } from '@/components/ui/separator';
import { ProfileButton } from '@/components/profile-button';
import { authSlice } from '@/store/auth';
import { Button } from '../ui/button';
import { Link } from 'react-router';

export const Header = () => {
  const { auth } = authSlice(state => state)
  return (
    <header className="flex items-center justify-between py-4">
      <img src={logo} className='w-28 md:w-44' />
      <div className='flex items-center gap-2'>
        {auth.user.admin && (
          <Button variant='outline' asChild>
            <Link to='/admin/channels'>
              Admin
            </Link>
          </Button>
        )}
        <Separator orientation="vertical" className="h-5" />
        <ModeToggle />
        <Separator orientation="vertical" className="h-5" />
        <ProfileButton />
      </div>
    </header>
  )
}