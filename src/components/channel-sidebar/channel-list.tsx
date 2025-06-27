import { Channel } from "@/http/fetch-channels"
import { EmptyIndicator } from "../empty-indicator"
import { Link, useParams } from "react-router"
import { Hash, Loader2, AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type ChannelListProps = {
  channels: Channel[]
  loading?: boolean
  error?: string
}

export function ChannelList({ channels, error, loading }: ChannelListProps) {
  const { slug } = useParams()

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
    <ul className='overflow-y-scroll max-h-96 no-scrollbar gap-2 flex flex-col'>
      {!channels?.length && !loading && <EmptyIndicator title='Não há canais por aqui' />}
      {channels?.map(channel => (
        <li
          key={channel.id}
          className={`group border-1 ${slug === channel.slug ? 'border-green-500 hover:border-green-500' : 'border-transparent'} hover:border-foreground/10 w-full text-left rounded-lg transition-colors hover:bg-background/60 text-foreground cursor-pointer`}
        >
          <Link
            to={`/channels/${channel.slug}`}
          >
            <button
              className={`w-full text-left p-2 rounded-lg transition-colors hover:bg-background/60 text-foreground cursor-pointer`}
            >
              <div className={`flex items-center space-x-2 text-sm ${slug === channel.slug ? 'text-green-500' : 'font-normal'}`}>
                <Hash className="w-4 h-4 " />
                <span className='text-sm truncate capitalize' >{channel.title}</span>
              </div>
              <p className="text-xs text-gray-500 ml-6 mt-1 truncate">{channel.description}</p>
            </button>
          </Link>
        </li>
      ))}
    </ul>
  )
}