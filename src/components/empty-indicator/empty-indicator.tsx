import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type EmptyIndicatorProps = {
  title?: string
  content?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function EmptyIndicator({
  title = 'Nada para mostrar',
  content,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyIndicatorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-4 text-center', className)}>
      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {content && <p className="text-xs text-muted-foreground text-balance">{content}</p>}
      </div>
      {action}
    </div>
  )
}
