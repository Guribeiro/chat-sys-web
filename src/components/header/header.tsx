import { Link } from 'react-router';

import { ModeToggle } from '@/components/mode-toggle';
import { ProfileButton } from '@/components/profile-button';
import { Brand } from '@/components/brand';
import { PendingInvites } from './pending-invites';
import { ActivityButton } from '../activity/activity-button';
import { SearchPalette } from '../search/search-palette';

export const Header = () => {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-3 lg:px-4">
      <Link to="/channels" className="rounded-md" aria-label="Realtime chat, ir para os canais">
        <Brand nameClassName="hidden sm:inline" />
      </Link>

      <div className="flex flex-1 justify-end md:justify-center">
        <SearchPalette />
      </div>

      <div className="flex items-center gap-0.5">
        <ActivityButton />
        <PendingInvites />
        <ModeToggle />
        <span className="mx-1.5 h-5 w-px bg-border" aria-hidden="true" />
        <ProfileButton />
      </div>
    </header>
  )
}
