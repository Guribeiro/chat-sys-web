import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Camera, Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/user-avatar'
import { changePassword, removeAvatar, updateProfile, uploadAvatar } from '@/http/profile'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { authSlice } from '@/store/auth'

const MAX_AVATAR_MB = 10

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(100),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe sua senha atual'),
  newPassword: z.string().min(6, 'A nova senha precisa ter pelo menos 6 caracteres').max(128),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})

export function ProfilePage() {
  const { auth, updateUser } = authSlice(state => state)
  const user = auth?.user
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '' },
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const profileMutation = useMutation({
    mutationFn: (values: z.infer<typeof profileSchema>) => updateProfile({ name: values.name ?? "" }),
    onSuccess: ({ data }) => {
      updateUser({ name: data.name })
      toast.success('Perfil atualizado')
    },
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  const avatarMutation = useMutation({
    mutationFn: (file: File | null) => (file ? uploadAvatar(file) : removeAvatar()),
    onSuccess: ({ data }) => {
      updateUser({ avatarUrl: data.avatarUrl })
      toast.success(data.avatarUrl ? 'Foto atualizada' : 'Foto removida')
    },
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: z.infer<typeof passwordSchema>) =>
      changePassword({ currentPassword, newPassword, refreshToken: auth?.refreshToken }),
    onSuccess: () => {
      passwordForm.reset()
      toast.success('Senha alterada. As outras sessões foram encerradas.')
    },
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  const pickAvatar = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Escolha uma imagem (PNG, JPG, WEBP ou GIF)')
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) return toast.error(`A imagem deve ter até ${MAX_AVATAR_MB} MB`)
    avatarMutation.mutate(file)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Meu perfil</CardTitle>
          <CardDescription>Como as outras pessoas veem você no chat.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} className="h-24 w-24 text-xl" />
              {avatarMutation.isPending && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              hidden
              onChange={(event) => {
                pickAvatar(event.target.files?.[0])
                event.target.value = ''
              }}
            />
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={avatarMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" /> Trocar foto
              </Button>
              {user?.avatarUrl && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label="Remover foto"
                  disabled={avatarMutation.isPending}
                  onClick={() => avatarMutation.mutate(null)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit((values) => profileMutation.mutate(values))}
              className="flex flex-1 flex-col gap-4"
            >
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <Input value={user?.email ?? ''} disabled readOnly />
              </FormItem>
              <Button type="submit" className="self-end" disabled={profileMutation.isPending || !profileForm.formState.isDirty}>
                {profileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
          <CardDescription>Ao trocar a senha, as sessões em outros dispositivos são encerradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit((values) => passwordMutation.mutate(values))}
              className="flex flex-col gap-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha atual</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar nova senha</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="self-end" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Alterar senha
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
