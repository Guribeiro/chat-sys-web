import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from 'zod'
import { Link } from "react-router"
import { requestPasswordRecover } from '@/http/request-password-recover'

import logo from '@/assets/logo.png'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { handleAxiosError } from "@/lib/axios-error-handler"

const formSchema = z.object({
  email: z.string().min(1, 'Informe seu usuário'),
})

type ForgotPasswordForm = z.infer<typeof formSchema>

export const ForgotPassword = () => {

  const forgotPasswordMutation = useMutation({
    mutationKey: ['forgot-password'],
    mutationFn: async ({ email }: ForgotPasswordForm) => {
      await requestPasswordRecover({ email })
    },
    onSuccess: () => {
      toast.success('Email is on its way! Check your inbox for instructions on how to reset your password!')
      form.reset()
    },
    onError: (error) => {
      const errorMessage = handleAxiosError(error)
      toast.error(errorMessage)
    }
  })

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit({ email }: z.infer<typeof formSchema>) {
    forgotPasswordMutation.mutate({
      email,
    })
  }

  return (
    <div className="bg-gradient-to-b from-primary to-secondary flex flex-col min-h-screen justify-center h-full w-full px-4">
      <Card className="mx-auto max-w-md w-full py-6">
        <img src={logo} className="w-52 m-auto" alt="Sorocaps" />
        <CardHeader>
          <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
          <CardDescription>
            Preencha com seu usuário e senha para acessar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {forgotPasswordMutation.isPending ? <Loader2 className="animate-spin" /> : 'Enviar'}
                </Button>
                <Button asChild variant="link">
                  <Link
                    className="text-sm text-muted-foreground hover:text-primary transition-all duration-200"
                    to="/"
                  >
                    Voltar
                  </Link>
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}