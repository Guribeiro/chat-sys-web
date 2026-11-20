import { useState } from 'react'
import { SmilePlus } from 'lucide-react'

import type { MessageReaction } from '@/http/fetch-channel-messages'
import { cn } from '@/lib/utils'
import { authSlice } from '@/store/auth'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🙏', '👀', '✅', '🔥']

type Group = { emoji: string; count: number; mine: boolean; names: string[] }

function groupReactions(reactions: MessageReaction[], userId?: string): Group[] {
  const groups = new Map<string, Group>()
  for (const reaction of reactions) {
    const group = groups.get(reaction.emoji) ?? { emoji: reaction.emoji, count: 0, mine: false, names: [] }
    group.count++
    group.mine ||= reaction.userId === userId
    group.names.push(reaction.userId === userId ? 'Você' : reaction.user?.name ?? 'Alguém')
    groups.set(reaction.emoji, group)
  }
  return [...groups.values()]
}

type ReactionPickerProps = {
  onPick: (emoji: string) => void
  align?: 'start' | 'end'
  className?: string
}

export function ReactionPicker({ onPick, align = 'start', className }: ReactionPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Reagir"
          className={cn('h-7 w-7 p-0', className)}
        >
          <SmilePlus className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-1">
        <div className="grid grid-cols-5 gap-0.5">
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              aria-label={`Reagir com ${emoji}`}
              onClick={() => {
                onPick(emoji)
                setOpen(false)
              }}
              className="h-9 w-9 rounded-md text-xl leading-none transition-transform hover:bg-muted hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

type MessageReactionsProps = {
  reactions: MessageReaction[]
  onToggle: (emoji: string) => void
  alignEnd?: boolean
}

export function MessageReactions({ reactions, onToggle, alignEnd }: MessageReactionsProps) {
  const userId = authSlice(state => state.auth?.user?.id)
  const groups = groupReactions(reactions, userId)
  if (!groups.length) return null

  return (
    <div className={cn('mt-1 flex flex-wrap gap-1', alignEnd && 'justify-end')}>
      {groups.map(group => (
        <button
          key={group.emoji}
          type="button"
          onClick={() => onToggle(group.emoji)}
          title={group.names.join(', ')}
          aria-pressed={group.mine}
          aria-label={`${group.emoji} ${group.count}: ${group.names.join(', ')}`}
          className={cn(
            'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
            group.mine
              ? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
              : 'border-border bg-background text-foreground hover:bg-muted',
          )}
        >
          <span className="text-sm leading-none">{group.emoji}</span>
          <span className="tabular-nums">{group.count}</span>
        </button>
      ))}
    </div>
  )
}
