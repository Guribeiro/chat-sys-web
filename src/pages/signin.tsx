import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authSlice } from "@/store/auth"
import { EyeIcon, EyeOffIcon, GalleryThumbnails, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from 'zod'

import logo from '@/assets/logo.png'

import { zodResolver } from '@hookform/resolvers/zod'
import { createElement, useState } from "react"

const formSchema = z.object({
  email: z.string().min(1, 'Informe seu usuário'),
  password: z
    .string()
    .min(3, { message: 'Informe sua senha' })
})

export const SigninPage = () => {
  const { loading, signin } = authSlice(state => state)

  const [passwordVisibility, setPasswordVisibility] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    signin(values)
  }

  return (
    <div className="bg-gradient-to-b from-primary to-secondary flex flex-col min-h-screen justify-center h-full w-full px-4">
      <Card className="mx-auto max-w-md w-full py-6">
        <img src={logo} className="w-52 m-auto" alt="Sorocaps" />
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
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
                      <FormLabel htmlFor="email">Usuário</FormLabel>
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
                  {loading ? <Loader2 className="animate-spin" /> : 'Login'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}