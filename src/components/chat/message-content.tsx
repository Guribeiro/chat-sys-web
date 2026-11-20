import { memo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

import { cn } from '@/lib/utils'
import { MENTION_TOKEN } from './mentions'

const MENTION_HREF = '#mention-'

const escapeLinkText = (text: string) => text.replace(/[[\]\\]/g, '\\$&')

type MessageContentProps = {
  content: string
  names: Map<string, string | null>
  currentUserId?: string
  /** Own messages sit on the green bubble and need light accents */
  inverted?: boolean
}

/**
 * Renders a message as GitHub-flavoured Markdown. Raw HTML is never rendered (react-markdown
 * escapes it) and images are dropped; mention tokens become highlighted chips.
 */
export const MessageContent = memo(function MessageContent({ content, names, currentUserId, inverted }: MessageContentProps) {
  // <@id> -> [@Name](#mention-id), turned into a chip by the `a` renderer below
  const markdown = content.replace(MENTION_TOKEN, (_token, id: string) => {
    const name = names.get(id.toLowerCase()) ?? 'alguém'
    return `[@${escapeLinkText(name)}](${MENTION_HREF}${id.toLowerCase()})`
  })

  const components: Components = {
    a: ({ href, children }) => {
      if (href?.startsWith(MENTION_HREF)) {
        const isMe = href.slice(MENTION_HREF.length) === currentUserId
        return (
          <span
            className={cn(
              'rounded px-1 font-medium',
              isMe
                ? 'bg-amber-300/80 text-amber-950'
                : inverted ? 'bg-white/25 text-white' : 'bg-green-100 text-green-800',
            )}
          >
            {children}
          </span>
        )
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 break-all">
          {children}
        </a>
      )
    },
    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="mb-1 list-disc pl-5 last:mb-0">{children}</ul>,
    ol: ({ children }) => <ol className="mb-1 list-decimal pl-5 last:mb-0">{children}</ol>,
    blockquote: ({ children }) => (
      <blockquote className={cn('mb-1 border-l-2 pl-2 italic opacity-90', inverted ? 'border-white/60' : 'border-gray-300')}>
        {children}
      </blockquote>
    ),
    code: ({ className, children }) => (
      <code className={cn('rounded px-1 py-0.5 font-mono text-[0.85em]', inverted ? 'bg-black/20' : 'bg-gray-100', className)}>
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className={cn('mb-1 overflow-x-auto rounded p-2 text-xs [&>code]:bg-transparent [&>code]:p-0', inverted ? 'bg-black/20' : 'bg-gray-100')}>
        {children}
      </pre>
    ),
    // Headings would be huge inside a chat bubble: render them as bold paragraphs
    h1: ({ children }) => <p className="mb-1 font-bold">{children}</p>,
    h2: ({ children }) => <p className="mb-1 font-bold">{children}</p>,
    h3: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
    h4: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
    h5: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
    h6: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
    hr: () => <hr className="my-2 border-current opacity-30" />,
    table: ({ children }) => (
      <div className="mb-1 overflow-x-auto">
        <table className="text-xs [&_td]:border [&_td]:border-current/20 [&_td]:px-2 [&_th]:border [&_th]:border-current/20 [&_th]:px-2">
          {children}
        </table>
      </div>
    ),
  }

  return (
    <div className="text-sm leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
        disallowedElements={['img']}
        unwrapDisallowed
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
})
