import { Input } from '@/components/ui/input';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { z } from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router';

const createChannelFormSchema = z.object({
  title: z.string().min(1, 'Adicione um titulo para o canal').nullable(),
  description: z.string().nullable(),
})

type CreateChannelForm = z.infer<typeof createChannelFormSchema>

export const ChannelForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { search } = useLocation()
  const navigate = useNavigate()

  const searchQueries = useMemo(() => {
    return new URLSearchParams(search)
  }, [search])

  const form = useForm<CreateChannelForm>({
    resolver: zodResolver(createChannelFormSchema)
  })

  const handleCreateChannel = ({ title, description }: CreateChannelForm) => {
    console.log({ title, description })
  };

  const handleCancelCreatingChannel = () => {
    setIsDialogOpen(false)
    form.reset({
      title: null,
      description: null
    })

    navigate(location.pathname, { replace: true });
  }

  useEffect(() => {
    form.setValue('title', searchQueries.get('title'))
    form.setValue('description', searchQueries.get('description'))
  }, [searchQueries, form])


  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar canal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateChannel)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className='flex flex-col gap-0.5'>
                  <FormLabel className="text-sm font-medium text-foreground">Título do canal</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. announcements"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className='flex flex-col gap-0.5'>
                  <FormLabel className="text-sm font-medium text-foreground">Descrição do canal</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Sobre o que é esse canal?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1 text-foreground active:bg-primary/60 ">Create Channel</Button>
              <Button type="button" variant="outline" onClick={handleCancelCreatingChannel}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}