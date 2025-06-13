import { Member } from "@/http/fetch-channel-members"
import { EmptyIndicator } from "../empty-indicator"
import { Loader2, AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

import { ChannelMemberListItem } from "../../pages/admin/components/admin-channel-member-list-item";
import { MemberItem } from "@/pages/admin/components/member-item";

type ChannelMembersListProps = {
  data: Member[]
  loading?: boolean
  error?: string
}

export function ChannelMembersList({ data, error, loading }: ChannelMembersListProps) {
  if (loading) {
    return <div className="flex items-center justify-center bg-opacity-50 rounded-md cursor-not-allowed">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          <p>{error}</p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <ul className='overflow-y-scroll max-h-52 no-scrollbar gap-2 flex flex-col'>
      {!data?.length && !loading && <EmptyIndicator title='Não há membros por aqui' />}
      <ul className="space-y-1">
        {data?.map(member => (
          <li
            key={member.id}
            className={`border-1 border-transparent  hover:border-green-500 w-full text-left p-2 rounded-lg transition-colors hover:bg-background/60 text-foreground cursor-pointer`}
          >
            <MemberItem key={member.id} data={member} />
          </li>
        ))}
      </ul>
    </ul>
  )
}