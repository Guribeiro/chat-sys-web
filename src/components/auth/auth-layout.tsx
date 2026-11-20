import type { ReactNode } from 'react'
import { Paperclip } from 'lucide-react'

import { Brand } from '../brand'

type AuthLayoutProps = {
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/** A small, static conversation drawn with the app's own bubble styles. */
function ProductPreview() {
  return (
    <div aria-hidden="true" className="w-full max-w-sm select-none space-y-1 text-sm">
      <div className="flex items-end gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[11px] font-semibold text-amber-900">HR</span>
        <div className="space-y-0.5">
          <p className="px-1 pb-0.5 text-xs font-medium text-muted-foreground">Heloísa Reis</p>
          <p className="w-fit rounded-2xl rounded-bl-md bg-bubble-other px-3.5 py-2 text-bubble-other-foreground">
            Subi o layout novo do onboarding
          </p>
          <div className="flex w-fit items-center gap-2 rounded-2xl rounded-tl-md bg-bubble-other px-3 py-2 text-bubble-other-foreground">
            <Paperclip className="size-3.5 opacity-70" />
            <span className="text-xs font-medium">onboarding-v2.fig</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-3">
        <div className="flex flex-col items-end gap-1">
          <p className="w-fit rounded-2xl rounded-br-md bg-bubble-own px-3.5 py-2 text-bubble-own-foreground">
            Ficou ótimo! <span className="rounded bg-white/20 px-1 font-medium">@Gabriel</span> dá uma olhada?
          </p>
          <span className="flex h-6 items-center gap-1 rounded-full border bg-background px-2 text-xs">🎉 <span className="font-medium">3</span></span>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <span className="typing-dot size-1 rounded-full bg-current" />
          <span className="typing-dot size-1 rounded-full bg-current" />
          <span className="typing-dot size-1 rounded-full bg-current" />
        </span>
        Gabriel está digitando
      </div>
    </div>
  )
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-sidebar p-10 lg:flex">
        <Brand />
        <div className="flex flex-col items-start gap-10">
          <div className="max-w-md space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Conversas do time, no momento em que acontecem.
            </h2>
            <p className="text-muted-foreground text-pretty">
              Canais, mensagens diretas, menções, reações e anexos — tudo sincronizado em tempo real.
            </p>
          </div>
          <ProductPreview />
        </div>
        <p className="text-xs text-muted-foreground">Feito com React, Socket.io e Postgres.</p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-8">
        <Brand className="lg:hidden" />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {description && <p className="text-sm text-muted-foreground text-pretty">{description}</p>}
            </div>
            {children}
            {footer && <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  )
}
