import { Link, Outlet, useLocation } from 'react-router';
import { ChevronRight } from 'lucide-react';

import { useChannel } from '@/hooks/use-channels';
import { slugToOriginalText } from '@/lib/utils';

const PREFIX = '/admin/channels'

export const Admin = () => {
  const { pathname } = useLocation();
  const slug = pathname.startsWith(`${PREFIX}/`) ? pathname.slice(PREFIX.length + 1).split('/')[0] : undefined
  const { channel } = useChannel(slug)
  const channelTitle = channel?.title ?? (slug ? slugToOriginalText(slug) : undefined)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:py-10">
      <nav aria-label="Trilha" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/channels" className="transition-colors hover:text-foreground">Conversas</Link>
        <ChevronRight className="size-3.5" />
        {slug ? (
          <>
            <Link to={PREFIX} className="transition-colors hover:text-foreground">Gerenciar canais</Link>
            <ChevronRight className="size-3.5" />
            <span className="truncate text-foreground" aria-current="page">{channelTitle}</span>
          </>
        ) : (
          <span className="text-foreground" aria-current="page">Gerenciar canais</span>
        )}
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {slug ? <><span className="text-muted-foreground">#</span>{channelTitle}</> : 'Gerenciar canais'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {slug ? 'Membros, visibilidade e dados do canal.' : 'Canais que você administra: crie, edite, convide pessoas e ajuste a visibilidade.'}
        </p>
      </header>

      <Outlet />
    </div>
  );
};
