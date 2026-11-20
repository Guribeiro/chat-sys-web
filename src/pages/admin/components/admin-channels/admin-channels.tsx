import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AlertCircleIcon, Hash, Plus, Search } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateChannelDialog } from '@/components/channel-manage/create-channel-dialog';
import type { Status } from '@/http/fetch-channels';
import { useAdminChannels } from '@/hooks/use-admin-channels';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { cn } from '@/lib/utils';
import { authSlice } from '@/store/auth';
import { AdminChannelCard } from './components/admin-channel-card';
import { ChannelCardSkeleton } from './components/channel-card-skeleton';

const filters: Array<{ value: 'all' | 'active' | 'deactive'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'deactive', label: 'Inativos' },
]

function normalize(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function AdminChannels() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [term, setTerm] = useState('')
  const userId = authSlice(state => state.auth?.user?.id)

  const param = searchParams.get('status')
  const status: Status = param === 'active' || param === 'deactive' ? param : null
  const current = status ?? 'all'

  const { data, isPending, error } = useAdminChannels(status)

  const channels = useMemo(() => {
    const needle = normalize(term.trim())
    return (data ?? []).filter(channel => !needle || normalize(`${channel.title} ${channel.description ?? ''}`).includes(needle))
  }, [data, term])

  const setFilter = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('status')
    else next.set('status', value)
    setSearchParams(next, { replace: true });
  };

  return (
    <div className='space-y-4 pb-4'>
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Não foi possível carregar os canais</AlertTitle>
          <AlertDescription><p>{handleAxiosError(error)}</p></AlertDescription>
        </Alert>
      )}

      <div className='flex flex-wrap items-center gap-3'>
        <div role="radiogroup" aria-label="Filtrar por status" className='inline-flex rounded-lg bg-muted p-0.5'>
          {filters.map(filter => (
            <button
              key={filter.value}
              type="button"
              role="radio"
              aria-checked={current === filter.value}
              onClick={() => setFilter(filter.value)}
              className={cn(
                'h-8 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                current === filter.value ? 'bg-background text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08)]' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={term}
            onChange={event => setTerm(event.target.value)}
            placeholder="Buscar canal"
            aria-label="Buscar canal por nome ou descrição"
            className="h-9 pl-9"
          />
        </div>
        <CreateChannelDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Criar canal
            </Button>
          }
        />
      </div>

      {isPending ? (
        <ul className="divide-y overflow-hidden rounded-xl border" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => <ChannelCardSkeleton key={index} />)}
        </ul>
      ) : !channels.length ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
          <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Hash className="size-5" />
          </span>
          <p className="text-sm font-medium">
            {term ? 'Nenhum canal corresponde à busca' : current === 'all' ? 'Você ainda não administra nenhum canal' : 'Nenhum canal com esse status'}
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {term ? 'Tente outro nome.' : current === 'all' ? 'Crie um canal para reunir pessoas em torno de um assunto.' : 'Troque o filtro para ver os outros canais.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border">
          {channels.map((channel) => (
            <AdminChannelCard key={channel.id} data={channel} isOwner={channel.ownerId === userId} />
          ))}
        </ul>
      )}
    </div>
  )
}
