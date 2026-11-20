import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router'
import { isAxiosError } from 'axios'
import { ArrowLeft, Hash, Lock, MailPlus, SearchX, Settings, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useChannelDetails } from '@/hooks/use-channel-details'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { cn } from '@/lib/utils'
import { useManageRoom } from './use-manage-room'
import type { ManageContext } from './manage-context'


function ManageState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center rounded-xl border border-dashed px-6 py-12 text-center">
        <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</span>
        <h1 className="text-sm font-medium">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground text-balance">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  )
}

/**
 * Channel management inside the workspace: same column as the conversation, sidebar still visible.
 * Only owners and admins get past the guard; everyone else sees why, and a way back.
 */
export function ChannelManageLayout() {
  const { slug } = useParams()
  const { data: channel, isPending, error } = useChannelDetails(slug)
  useManageRoom(slug, channel?.viewer.isAdmin ? channel.id : undefined)

  const backToChannels = (
    <Button variant="outline" size="sm" asChild>
      <Link to="/channels">Voltar para as conversas</Link>
    </Button>
  )

  if (isPending) {
    return (
      <div className="flex h-full flex-col" aria-busy="true" aria-label="Carregando canal">
        <div className="flex h-14 items-center gap-3 border-b px-4">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-6 lg:px-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (error || !channel) {
    const status = isAxiosError(error) ? error.response?.status : undefined
    if (status === 404) {
      return (
        <ManageState
          icon={<SearchX className="size-5" />}
          title="Canal não encontrado"
          description="Ele pode ter sido excluído ou renomeado."
          action={backToChannels}
        />
      )
    }
    if (status === 403) {
      return (
        <ManageState
          icon={<Lock className="size-5" />}
          title="Você não participa deste canal"
          description="Somente membros com papel de administrador podem gerenciá-lo."
          action={backToChannels}
        />
      )
    }
    return (
      <ManageState
        icon={<Hash className="size-5" />}
        title="Não foi possível abrir o canal"
        description={handleAxiosError(error)}
        action={backToChannels}
      />
    )
  }

  if (channel.type === 'DIRECT') {
    return (
      <ManageState
        icon={<Hash className="size-5" />}
        title="Mensagens diretas não têm gestão"
        description="Membros, convites e configurações existem apenas em canais."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to={`/channels/${channel.slug}`}>Voltar para a conversa</Link>
          </Button>
        }
      />
    )
  }

  if (!channel.viewer.isAdmin) {
    return (
      <ManageState
        icon={<Lock className="size-5" />}
        title="Você não administra este canal"
        description="Peça a um administrador do canal para mudar membros, convites ou configurações."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to={`/channels/${channel.slug}`}>Voltar para #{channel.title}</Link>
          </Button>
        }
      />
    )
  }

  const tabs = [
    { to: 'members', label: 'Membros', icon: Users },
    { to: 'invites', label: 'Convites', icon: MailPlus },
    { to: 'settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="flex h-full min-w-0 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2 lg:px-4">
        <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
          <Link to={`/channels/${channel.slug}`} aria-label={`Voltar para #${channel.title}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
            <Hash className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{channel.title}</span>
          </h1>
          <span className="shrink-0 text-sm text-muted-foreground">Gerenciar canal</span>
          {!channel.active && (
            <span className="shrink-0 rounded-full border px-2 text-xs leading-5 text-muted-foreground">Inativo</span>
          )}
        </div>
      </header>

      <nav aria-label="Seções da gestão do canal" className="shrink-0 overflow-x-auto border-b">
        {/* Same centered column as the content below; tab labels line up with its left edge */}
        <div className="mx-auto flex w-full max-w-5xl gap-1 px-1 lg:px-3">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                '-mb-px flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-6 lg:py-8">
          <Outlet context={{ channel } satisfies ManageContext} />
        </div>
      </div>
    </div>
  )
}
