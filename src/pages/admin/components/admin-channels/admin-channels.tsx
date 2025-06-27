import { Card, CardContent } from '@/components/ui/card';
import { Hash } from 'lucide-react';
import { fetchChannels, Status } from '@/http/fetch-channels';
import { useQuery } from '@tanstack/react-query';
import { AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMemo } from 'react';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { AdminChannelForm } from '../admin-channel-form';
import { AdminChannelCard } from './components/admin-channel-card';
import { Button } from '@/components/ui/button';
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

      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => toggleFilter({ filterName: 'status', filterValue: 'all' })}
            className={`border-1 ${!status && 'border-green-500 animate-pulse'} `}
          >
            Todos
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => toggleFilter({ filterName: 'status', filterValue: 'active' })}
            className={`border-1 ${status === 'active' && 'border-green-500 animate-pulse'} `}
          >
            Ativos
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => toggleFilter({ filterName: 'status', filterValue: 'deactive' })}
            className={`border-1 ${status === 'deactive' && 'border-green-500 animate-pulse'} `}
          >
            Inativos
          </Button>
        </div>
        <AdminChannelForm />
      </div>

      {!channels.length && !isFetching && (
        <Card>
          <CardContent className="text-center py-12">
            <Hash className="w-4 h-4 lg:w-8 lg:h-8 text-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground/50 mb-2">Nenhum canal criado</h3>
            <p className="text-foreground/40 mb-6">Crie seu primeiro canal</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">

        {isFetching && !channels.length ? (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <ChannelCardSkeleton key={index} />
            ))}
          </>
        ) : (
          <>
            {channels.map((channel) => <AdminChannelCard key={channel.id} data={channel} />)}
          </>
        )}

      </div>
    </div>
  )
}