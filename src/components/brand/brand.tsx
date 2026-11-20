import { cn } from '@/lib/utils'

/** Product mark: a speech bubble with a live "typing" ellipsis. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-7 shrink-0', className)}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M9 10.5A2.5 2.5 0 0 1 11.5 8h9A2.5 2.5 0 0 1 23 10.5v7a2.5 2.5 0 0 1-2.5 2.5H15l-4.2 3.4c-.5.4-1.3 0-1.3-.6V20A2.5 2.5 0 0 1 9 17.5z"
        className="fill-primary-foreground"
      />
      <circle cx="13" cy="14" r="1.3" className="fill-primary" />
      <circle cx="16" cy="14" r="1.3" className="fill-primary" />
      <circle cx="19" cy="14" r="1.3" className="fill-primary" />
    </svg>
  )
}

export function Brand({ className, nameClassName }: { className?: string; nameClassName?: string }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <BrandMark />
      <span className={cn('text-[15px] font-semibold tracking-tight text-foreground', nameClassName)}>Realtime chat</span>
    </span>
  )
}
