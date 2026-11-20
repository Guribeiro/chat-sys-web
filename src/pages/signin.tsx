import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { Loader2 } from "lucide-react"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { AuthLayout } from "@/components/auth/auth-layout"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authSlice } from "@/store/auth"

const formSchema = z.object({
  email: z.string().trim().min(1, 'Informe seu e-mail'),
  password: z.string().min(1, 'Informe sua senha'),
})

export const SigninPage = () => {
  const { loading, signin } = authSlice(state => state)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit({ email, password }: z.infer<typeof formSchema>) {
    signin({ email, password })
  }

  return (
    <AuthLayout
      title="Entrar"
      description="Bom te ver de novo. Entre para continuar suas conversas."
      footer={
        <>
          Não tem conta?{' '}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/signup">Criar conta</Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Senha</FormLabel>
                  <Link to="/forgot-password" className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-1 w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
