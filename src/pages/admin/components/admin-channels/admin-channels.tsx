
import { Card, CardContent } from '@/components/ui/card';
import { Hash } from 'lucide-react';
import { fetchChannels } from '@/http/fetch-channels';
import { useQuery } from '@tanstack/react-query';

import { AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMemo } from 'react';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { AdminChannelForm } from '../admin-channel-form';
import { Outlet } from 'react-router';
import { AdminChannelCard } from './components/admin-channel-card';

export function AdminChannels() {
  const { data: channels, isFetching, error } = useQuery({
    queryKey: ['admin', 'channels'],
    initialData: [],
    queryFn: async () => {
      const { data } = await fetchChannels()
      return data
    },
  })

  const errorMessage = useMemo(() => {
    if (error) return handleAxiosError(error)
  }, [error])


  if (isFetching && !channels.length) {
    return (
      <h1>Carregando...</h1>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          <p>{errorMessage}</p>
        </AlertDescription>
      </Alert>
    )
  }


  if (!channels.length && !isFetching) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Hash className="w-4 h-4 lg:w-8 lg:h-8 text-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground/50 mb-2">Nenhum canal criado</h3>
          <p className="text-foreground/40 mb-6">Crie seu primeiro canal</p>
          <AdminChannelForm buttonText='Criar primeiro canal' />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <AdminChannelForm />
      </div>

      <div className="grid gap-6">
        {channels.map((channel) => <AdminChannelCard key={channel.id} data={channel} />)}
      </div>
      <Outlet />
    </div>
  )
}