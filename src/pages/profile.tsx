import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Camera, Loader2, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/auth/password-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/user-avatar'
import { changePassword, removeAvatar, updateProfile, uploadAvatar } from '@/http/profile'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { authSlice } from '@/store/auth'
import { Switch } from '@/components/ui/switch'
import { usePreferences } from '@/store/preferences'
import { notificationPermission, notificationsSupported, requestNotificationPermission, showNotification } from '@/lib/notifications'

const MAX_AVATAR_MB = 10

function NotificationsSection() {
  const enabled = usePreferences(state => state.desktopNotifications)
  const setEnabled = usePreferences(state => state.setDesktopNotifications)
  const [permission, setPermission] = useState(notificationPermission)
  const active = enabled && permission === 'granted'

  const toggle = async (next: boolean) => {
    if (!next) return setEnabled(false)
    const result = await requestNotificationPermission()
    setPermission(result)
    if (result === 'granted') {
      setEnabled(true)
      showNotification({ title: 'Notificações ativadas', body: 'É assim que avisaremos você com a aba em segundo plano.', tag: 'test' })
    } else if (result === 'denied') {
      toast.error('O navegador bloqueou as notificações. Libere nas configurações do site e tente de novo.')
    }
  }

  return (
    <section className="grid gap-6 py-8 md:grid-cols-[13rem_1fr]" aria-labelledby="notifications-heading">
      <div>
        <h2 id="notifications-heading" className="text-sm font-semibold">Notificações</h2>
        <p className="mt-1 text-sm text-muted-foreground">Vale só para este navegador. Conversas silenciadas avisam apenas menções e respostas.</p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
          <div className="min-w-0">
            <label htmlFor="desktop-notifications" className="text-sm font-medium">Notificações no computador</label>
            <p id="desktop-notifications-hint" className="mt-1 text-sm text-muted-foreground">
              Menções, respostas e mensagens diretas enquanto esta aba estiver em segundo plano.
            </p>
          </div>
          <Switch
            id="desktop-notifications"
            aria-describedby="desktop-notifications-hint"
            checked={active}
            disabled={!notificationsSupported || permission === 'denied'}
            onCheckedChange={toggle}
          />
        </div>
        {!notificationsSupported && (
          <p className="text-sm text-muted-foreground">Este navegador não oferece notificações. Os avisos dentro do app continuam funcionando.</p>
        )}
        {permission === 'denied' && (
          <p className="text-sm text-muted-foreground">As notificações estão bloqueadas para este site. Libere nas configurações do navegador para ativar.</p>
        )}
      </div>
    </section>
  )
}

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
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-12">
      <Link to="/channels" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar para as conversas
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Meu perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">Como as outras pessoas veem você e como você acessa sua conta.</p>

      <div className="mt-8 divide-y border-t">
        <section className="grid gap-6 py-8 md:grid-cols-[13rem_1fr]" aria-labelledby="profile-heading">
          <div>
            <h2 id="profile-heading" className="text-sm font-semibold">Perfil</h2>
            <p className="mt-1 text-sm text-muted-foreground">Foto e nome aparecem nas mensagens e na lista de membros.</p>
          </div>
          <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} className="size-20 text-xl" />
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
                <div className="flex flex-col items-start gap-1.5">
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
                      title="Remover foto"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={avatarMutation.isPending}
                      onClick={() => avatarMutation.mutate(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP ou GIF, até {MAX_AVATAR_MB} MB.</p>
                </div>
              </div>

              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit((values) => profileMutation.mutate(values))}
                  className="flex flex-col gap-4"
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
                    <p className="text-xs text-muted-foreground">O e-mail é usado para entrar e não pode ser alterado aqui.</p>
                  </FormItem>
                  <Button type="submit" className="self-end" disabled={profileMutation.isPending || !profileForm.formState.isDirty}>
                    {profileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {profileMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </form>
              </Form>
          </div>
        </section>

        <NotificationsSection />

        <section className="grid gap-6 py-8 md:grid-cols-[13rem_1fr]" aria-labelledby="security-heading">
          <div>
            <h2 id="security-heading" className="text-sm font-semibold">Segurança</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ao trocar a senha, as sessões em outros dispositivos são encerradas.</p>
          </div>
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
                      <PasswordInput autoComplete="current-password" {...field} />
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
                        <PasswordInput autoComplete="new-password" {...field} />
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
                        <PasswordInput autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="self-end" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {passwordMutation.isPending ? 'Alterando...' : 'Alterar senha'}
              </Button>
            </form>
          </Form>
        </section>
      </div>
    </div>
  )
}
