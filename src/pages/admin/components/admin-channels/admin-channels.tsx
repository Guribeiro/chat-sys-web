
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hash, Users, Plus } from 'lucide-react';
import { fetchChannels } from '@/http/fetch-channels';
import { useQuery } from '@tanstack/react-query';

import { AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMemo } from 'react';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { AdminChannelForm } from '../admin-channel-form';
import { Link, Outlet } from 'react-router';
import { AdminChannelMembersList } from './components/admin-channel-members-list';

export function AdminChannels() {
  const { data: channels, isFetching, error } = useQuery({
    queryKey: ['admin'],
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
        {channels.map((channel) => {
          return (
            <Card key={channel.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">#{channel.titulo}</CardTitle>
                      {channel.descricao && (
                        <p className="text-sm text-foreground/50 mt-1">{channel.descricao}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-foreground/50">
                    <Users className="w-4 h-4" />
                    <span>{channel.membros_count} membros</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Membros do canal:</h4>
                    <Link to={`/admin/channels/${channel.slug}/members`}>
                      <Button variant='outline' className='text-foreground'>
                        <Plus />
                        <p className='hidden lg:flex'>Adicionar membros</p>
                      </Button>
                    </Link>
                  </div>
                  <AdminChannelMembersList slug={channel.slug} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Outlet />
    </div>
  )
}