import { AlertCircleIcon } from "lucide-react"

import { Member } from "@/http/fetch-channel-members"
import { EmptyIndicator } from "../empty-indicator"
import { Skeleton } from "../ui/skeleton"
import { MemberItem } from "@/pages/admin/components/member-item";

export type MemberWithConnected = Member & {
  connected: boolean
}

type ChannelMembersListProps = {
  data: MemberWithConnected[] | undefined
  loading?: boolean
  error?: string
}

function Group({ title, members }: { title: string; members: MemberWithConnected[] }) {
  if (!members.length) return null
  return (
    <section aria-label={title}>
      <h3 className="px-2 pb-1 text-xs font-medium text-muted-foreground">
        {title} <span className="tabular">· {members.length}</span>
      </h3>
      <ul className="flex flex-col gap-px">
        {members.map(member => (
          <li key={member.id}>
            <MemberItem data={member} connected={member.connected} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ChannelMembersList({ data, error, loading }: ChannelMembersListProps) {
  if (loading && !data) {
    return (
      <div className="space-y-1 px-2" aria-busy="true" aria-label="Carregando membros">
        {[60, 72, 48, 66].map(width => (
          <div key={width} className="flex h-9 items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-3" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="mx-2 flex items-start gap-2 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
        <AlertCircleIcon className="mt-px size-3.5 shrink-0" />
        {error}
      </p>
    )
  }

  if (!data?.length) return <EmptyIndicator title="Não há membros por aqui" />

  const byName = (a: MemberWithConnected, b: MemberWithConnected) => a.member.name.localeCompare(b.member.name)
  const online = data.filter(member => member.connected).sort(byName)
  const offline = data.filter(member => !member.connected).sort(byName)

  return (
    <div className="flex flex-col gap-4">
      <Group title="Online" members={online} />
      <Group title="Offline" members={offline} />
    </div>
  )
}
