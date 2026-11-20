import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authSlice } from "@/store/auth"
import { createAccount } from "@/http/create-account"
import { handleAxiosError } from "@/lib/axios-error-handler"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { createElement, useState } from "react"
import { Link } from "react-router"

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
  const [passwordVisibility, setPasswordVisibility] = useState(false)

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
    onSuccess: () => toast.success('Conta criada! Bem-vindo(a).'),
    onError: (error) => toast.error(handleAxiosError(error)),
  })

  return (
    <div className="bg-gradient-to-b from-primary to-secondary flex flex-col min-h-screen justify-center h-full w-full px-4">
      <Card className="mx-auto max-w-md w-full py-6">
        <div className="text-center">
          <span className='text-muted-foreground text-2xl font-medium'>Realtime chat</span>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>
            Preencha seus dados para começar a conversar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => signupMutation.mutate(values))} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="name">Nome</FormLabel>
                    <FormControl>
                      <Input id="name" autoComplete="name" {...field} />
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
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input id="email" type="email" autoComplete="email" {...field} />
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
                    <FormLabel htmlFor="password">Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          placeholder="******"
                          type={passwordVisibility ? "text" : "password"}
                          autoComplete="new-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="link"
                          aria-label={passwordVisibility ? 'Ocultar senha' : 'Mostrar senha'}
                          className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
                          onClick={() => setPasswordVisibility(!passwordVisibility)}
                        >
                          {createElement(passwordVisibility ? EyeOffIcon : EyeIcon, { className: "h-6 w-6" })}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="confirmPassword">Confirmar senha</FormLabel>
                    <FormControl>
                      <Input
                        id="confirmPassword"
                        placeholder="******"
                        type={passwordVisibility ? "text" : "password"}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
                {signupMutation.isPending ? <Loader2 className="animate-spin" /> : 'Criar conta'}
              </Button>
              <Button asChild variant="link">
                <Link className="text-sm text-muted-foreground hover:text-primary transition-all duration-200" to="/">
                  Já tem conta? Entrar
                </Link>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
