/** Fixed-height line above the composer, so typing never shifts the conversation. */
export function TypingIndicator({ text }: { text: string | null }) {
  return (
    <div className="flex h-6 shrink-0 items-center gap-2 px-4 text-xs text-muted-foreground lg:px-6" aria-live="polite">
      {text && (
        <>
          <span className="flex items-center gap-0.5" aria-hidden="true">
            <span className="typing-dot size-1 rounded-full bg-current" />
            <span className="typing-dot size-1 rounded-full bg-current" />
            <span className="typing-dot size-1 rounded-full bg-current" />
          </span>
          <span className="truncate">{text.replace(/\.{3}$/, '')}</span>
        </>
      )}
    </div>
  )
}
