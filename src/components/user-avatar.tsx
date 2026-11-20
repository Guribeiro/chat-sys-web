import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { assetUrl } from '@/lib/asset-url'
import { cn } from '@/lib/utils'

type UserAvatarProps = {
  name?: string | null
  avatarUrl?: string | null
  className?: string
}

function initials(name?: string | null) {
  return (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('')
}

/** The user's uploaded photo, or a generated avatar (and initials while it loads). */
export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  const src = assetUrl(avatarUrl) ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name ?? '')}`

  return (
    <Avatar className={cn('h-8 w-8', className)}>
      <AvatarImage src={src} alt={name ?? ''} className="object-cover" />
      <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
