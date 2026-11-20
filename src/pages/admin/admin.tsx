import { Link, Outlet } from 'react-router';
import { ChevronRight } from 'lucide-react';

/** Administration area. Today: the channels I administer; workspace sections join here later. */
export const Admin = () => {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:py-10">
      <nav aria-label="Trilha" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/channels" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">Conversas</Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span className="text-foreground" aria-current="page">Canais que administro</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Canais que administro</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Abra um canal para cuidar de membros, convites e configurações. Canais inativos também aparecem aqui.
        </p>
      </header>

      <Outlet />
    </div>
  );
};
