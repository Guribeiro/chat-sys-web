import { Hash } from 'lucide-react';
import { fetchChannels, Status } from '@/http/fetch-channels';
import { useQuery } from '@tanstack/react-query';
import { AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMemo } from 'react';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { AdminChannelForm } from '../admin-channel-form';
import { AdminChannelCard } from './components/admin-channel-card';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router';
import { ChannelCardSkeleton } from './components/channel-card-skeleton';


export function AdminChannels() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') as Status;

  const { data: channels, isFetching, error } = useQuery({
    queryKey: ['admin', 'channels', status],
    initialData: [],
    queryFn: async () => {
      const { data } = await fetchChannels({ status, role: 'ADMIN' })
      return data
    },
  })

  const toggleFilter = ({ filterName, filterValue }: { filterName: string, filterValue: string }) => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (filterValue === 'all') {
      newSearchParams.delete(filterName);
    } else {
      newSearchParams.set(filterName, filterValue);
    }

    setSearchParams(newSearchParams);
  };

  const errorMessage = useMemo(() => {
    if (error) return handleAxiosError(error)
  }, [error])


  const filters: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'deactive', label: 'Inativos' },
  ]
  const current = status ?? 'all'

  return (
    <div className='space-y-4 pb-4'>
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            <p>{errorMessage}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div role="radiogroup" aria-label="Filtrar por status" className='inline-flex rounded-lg bg-muted p-0.5'>
          {filters.map(filter => (
            <button
              key={filter.value}
              type="button"
              role="radio"
              aria-checked={current === filter.value}
              onClick={() => toggleFilter({ filterName: 'status', filterValue: filter.value })}
              className={cn(
                'h-8 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                current === filter.value ? 'bg-background text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08)]' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <AdminChannelForm />
      </div>

      {!channels.length && !isFetching ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
          <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Hash className="size-5" />
          </span>
          <p className="text-sm font-medium">
            {current === 'all' ? 'Você ainda não administra nenhum canal' : 'Nenhum canal com esse status'}
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {current === 'all' ? 'Crie um canal para reunir pessoas em torno de um assunto.' : 'Troque o filtro para ver os outros canais.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border">
          {isFetching && !channels.length
            ? Array.from({ length: 3 }).map((_, index) => <ChannelCardSkeleton key={index} />)
            : channels.map((channel) => <AdminChannelCard key={channel.id} data={channel} />)}
        </ul>
      )}
    </div>
  )
}
