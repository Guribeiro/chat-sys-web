import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { createElement, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { handleAxiosError } from "@/lib/axios-error-handler"
import { resetPassword } from "@/http/reset-password"

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(3, { message: 'Informe sua senha' })
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export const ResetPassword = () => {

  const [passwordVisibility, setPasswordVisibility] = useState(false)

  const { code } = useParams()
  const navigate = useNavigate()

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const resetPasswordMutation = useMutation({
    mutationKey: ['reset-password', code],
    mutationFn: async ({ password }: ResetPasswordForm) => {
      // await requestPasswordRecover({ email })
      await resetPassword({ password, code })
    },
    onSuccess: () => {
      toast.success('Your password has been successfully reset. You can now log in with your new password.')
      navigate('/signin')
    },
    onError: (error) => {
      const errorMessage = handleAxiosError(error)
      toast.error(errorMessage)
    }
  })

  async function onSubmit({ password }: ResetPasswordForm) {
    resetPasswordMutation.mutate({
      password,
    })
  }

  return (
    <div className="bg-gradient-to-b from-primary to-secondary flex flex-col min-h-screen justify-center h-full w-full px-4">
      <Card className="mx-auto max-w-md w-full py-6">
        {/* <img src={logo} className="w-52 m-auto" alt="Sorocaps" /> */}
        <div className="text-center">
          <span className='text-muted-foreground text-2xl font-medium'>Realtime chat</span>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Preencha com a sua nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
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
                            autoComplete="current-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant={"link"}
                            className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
                            onClick={() => setPasswordVisibility(!passwordVisibility)}
                          >
                            {createElement(passwordVisibility ? EyeOffIcon : EyeIcon, {
                              className: "h-6 w-6",
                            })}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {resetPasswordMutation.isPending ? <Loader2 className="animate-spin" /> : 'Login'}
                </Button>
                <Button asChild variant="link">
                  <Link
                    className="text-sm text-muted-foreground hover:text-primary transition-all duration-200"
                    to="/forgot-password"
                  >
                    Esqueceu sua senha ?
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