import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { AuthLayout } from "@/components/auth/auth-layout"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { resetPassword } from "@/http/reset-password"
import { handleAxiosError } from "@/lib/axios-error-handler"

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres').max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export const ResetPassword = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const [passwordVisible, setPasswordVisible] = useState(false)

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const resetPasswordMutation = useMutation({
    mutationKey: ['reset-password', code],
    mutationFn: ({ password }: ResetPasswordForm) => resetPassword({ password, code }),
    onSuccess: () => {
      toast.success('Senha alterada. Entre com a nova senha.')
      navigate('/')
    },
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  return (
    <AuthLayout
      title="Criar nova senha"
      description="Escolha uma senha que você não use em outros lugares."
      footer={
        <>
          Link expirado?{' '}
          <Link to="/forgot-password" className="font-medium text-primary underline-offset-4 hover:underline">Pedir um novo</Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => resetPasswordMutation.mutate(values))} className="grid gap-5" noValidate>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Nova senha</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" autoFocus visible={passwordVisible} onVisibleChange={setPasswordVisible} {...field} />
                </FormControl>
                <FormDescription className="text-xs">Pelo menos 6 caracteres.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Confirmar nova senha</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" visible={passwordVisible} onVisibleChange={setPasswordVisible} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending && <Loader2 className="animate-spin" />}
            {resetPasswordMutation.isPending ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
