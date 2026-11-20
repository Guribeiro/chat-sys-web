import { useMemo, useState } from 'react'
import { AlertCircleIcon, Search, UserPlus, Users } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { InviteMemberDialog } from '@/components/channel-manage/invite-member-dialog'
import { useChannelMembers } from '@/hooks/use-channel-details'
import type { Member } from '@/http/fetch-channel-members'
import { handleAxiosError } from '@/lib/axios-error-handler'
import { authSlice } from '@/store/auth'
import { MemberRow } from './member-row'
import { useManagedChannel } from './manage-context'

/** Owner first, then admins, then members; alphabetical inside each group. */
const rank = (member: Member) => (member.isOwner ? 0 : member.role === 'ADMIN' ? 1 : 2)

function normalize(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function MembersTab() {
  const channel = useManagedChannel()
  const userId = authSlice(state => state.auth?.user?.id)
  const { data, isPending, error } = useChannelMembers(channel.slug)
  const [term, setTerm] = useState('')

  const members = useMemo(() => {
    const needle = normalize(term.trim())
    return [...(data ?? [])]
      .filter(member => !needle || normalize(`${member.member.name} ${member.member.email}`).includes(needle))
      .sort((a, b) => rank(a) - rank(b) || a.member.name.localeCompare(b.member.name, 'pt-BR'))
  }, [data, term])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Não foi possível carregar os membros</AlertTitle>
        <AlertDescription><p>{handleAxiosError(error)}</p></AlertDescription>
      </Alert>
    )
  }

  const total = data?.length ?? 0
  const admins = data?.filter(member => member.role === 'ADMIN').length ?? 0

  return (
    <section aria-labelledby="members-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="members-heading" className="text-base font-semibold">Membros</h2>
          <p className="text-sm text-muted-foreground">
            {isPending ? 'Carregando...' : (
              <>
                <span className="tabular">{total}</span> {total === 1 ? 'pessoa' : 'pessoas'}
                {' · '}
                <span className="tabular">{admins}</span> {admins === 1 ? 'administrador' : 'administradores'}
              </>
            )}
          </p>
        </div>
        <InviteMemberDialog
          slug={channel.slug}
          channelTitle={channel.title}
          trigger={
            <Button size="sm">
              <UserPlus className="size-4" />
              Convidar pessoas
            </Button>
          }
        />
      </div>

      {total > 6 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={term}
            onChange={event => setTerm(event.target.value)}
            placeholder="Filtrar por nome ou e-mail"
            aria-label="Filtrar membros por nome ou e-mail"
            className="pl-9"
          />
        </div>
      )}

      {isPending ? (
        <ul className="divide-y overflow-hidden rounded-xl border" aria-busy="true">
          {[0, 1, 2].map(index => (
            <li key={index} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </li>
          ))}
        </ul>
      ) : !members.length ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-12 text-center">
          <Users className="mb-3 size-5 text-muted-foreground" />
          <p className="text-sm font-medium">{term ? 'Ninguém corresponde ao filtro' : 'Ninguém neste canal ainda'}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {term ? 'Confira a grafia ou procure pelo e-mail.' : 'Convide pessoas para começar a conversa.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border">
          {members.map(member => (
            <MemberRow key={member.id} member={member} channel={channel} currentUserId={userId} />
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        {channel.viewer.isOwner
          ? 'Como dono, você pode rebaixar e remover administradores e transferir a posse do canal.'
          : 'Administradores promovem e removem membros. Rebaixar ou remover administradores é exclusivo do dono.'}
      </p>
    </section>
  )
}
