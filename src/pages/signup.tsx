import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { AuthLayout } from "@/components/auth/auth-layout"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createAccount } from "@/http/create-account"
import { handleAxiosError } from "@/lib/axios-error-handler"
import { authSlice } from "@/store/auth"

const formSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(100),
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres').max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})

type SignupForm = z.infer<typeof formSchema>

export const SignupPage = () => {
  const signin = authSlice(state => state.signin)
  const [passwordVisible, setPasswordVisible] = useState(false)

  const form = useForm<SignupForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const signupMutation = useMutation({
    mutationFn: async ({ name, email, password }: SignupForm) => {
      await createAccount({ name, email, password })
      // Account created: sign in right away (the routes switch to /channels on success)
      await signin({ email, password })
    },
    onSuccess: () => toast.success('Conta criada! Boas-vindas.'),
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  return (
    <AuthLayout
      title="Criar conta"
      description="Leva menos de um minuto. Depois é só entrar nos canais do seu time."
      footer={
        <>
          Já tem conta?{' '}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/">Entrar</Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => signupMutation.mutate(values))} className="grid gap-5" noValidate>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input autoComplete="name" autoFocus {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="voce@empresa.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" visible={passwordVisible} onVisibleChange={setPasswordVisible} {...field} />
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
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" visible={passwordVisible} onVisibleChange={setPasswordVisible} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-1 w-full" disabled={signupMutation.isPending}>
            {signupMutation.isPending && <Loader2 className="animate-spin" />}
            {signupMutation.isPending ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
