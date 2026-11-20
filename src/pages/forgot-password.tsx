import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, Loader2, MailCheck } from "lucide-react"
import { toast } from "sonner"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { requestPasswordRecover } from '@/http/request-password-recover'
import { handleAxiosError } from "@/lib/axios-error-handler"

const formSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido'),
})

type ForgotPasswordForm = z.infer<typeof formSchema>

const backToSignin = (
  <Link to="/" className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline">
    <ArrowLeft className="size-3.5" />
    Voltar para o login
  </Link>
)

export const ForgotPassword = () => {
  const [sentTo, setSentTo] = useState<string | null>(null)

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  const forgotPasswordMutation = useMutation({
    mutationKey: ['forgot-password'],
    mutationFn: ({ email }: ForgotPasswordForm) => requestPasswordRecover({ email }),
    onSuccess: (_data, { email }) => {
      setSentTo(email)
      form.reset()
    },
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  if (sentTo) {
    return (
      <AuthLayout
        title="Confira seu e-mail"
        description={<>Se existir uma conta para <strong className="font-medium text-foreground">{sentTo}</strong>, você vai receber um link para criar uma nova senha.</>}
        footer={backToSignin}
      >
        <div className="flex items-start gap-3 rounded-lg bg-muted/70 p-4 text-sm">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-muted-foreground">
            Não chegou em alguns minutos? Olhe a caixa de spam ou{' '}
            <button type="button" onClick={() => setSentTo(null)} className="font-medium text-foreground underline underline-offset-4">
              tente outro e-mail
            </button>.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Esqueceu a senha?"
      description="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
      footer={backToSignin}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => forgotPasswordMutation.mutate(values))} className="grid gap-5" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="voce@empresa.com" autoFocus {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
            {forgotPasswordMutation.isPending && <Loader2 className="animate-spin" />}
            {forgotPasswordMutation.isPending ? 'Enviando...' : 'Enviar link'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
