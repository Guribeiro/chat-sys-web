/** Fixed-height line above the composer, so typing never shifts the conversation. */
export function TypingIndicator({ text }: { text: string | null }) {
  return (
    // Same column as the composer: outer px-3/lg:px-6, centered max-w-5xl, px-1 like its hint line
    <div className="h-6 shrink-0 px-3 text-xs text-muted-foreground lg:px-6" aria-live="polite">
      <div className="mx-auto flex h-full max-w-5xl items-center gap-2 px-1">
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
    </div>
  )
}
