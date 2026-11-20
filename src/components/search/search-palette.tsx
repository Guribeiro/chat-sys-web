import { Fragment, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { Hash, Loader2, Search } from 'lucide-react'

import { searchMessages, type SearchResult } from '@/http/search-messages'
import { Button } from '../ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { UserAvatar } from '../user-avatar'

const DEBOUNCE_MS = 250

/** Renders the server highlights (\u0001 ... \u0002) as <mark>, without ever injecting HTML. */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split('\u0001').map((part, index) => {
        if (index === 0) return <Fragment key={index}>{part}</Fragment>
        const [match, rest] = part.split('\u0002')
        return (
          <Fragment key={index}>
            <mark className="rounded bg-amber-200 px-0.5 text-amber-950">{match}</mark>
            {rest}
          </Fragment>
        )
      })}
    </>
  )
}

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function SearchPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const term = useDebounced(query.trim(), DEBOUNCE_MS)
  const navigate = useNavigate()

  // Ctrl+K / Cmd+K anywhere opens the palette
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(current => !current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const { data, isFetching } = useQuery({
    queryKey: ['search', term],
    enabled: open && term.length >= 2,
    staleTime: 30_000,
    queryFn: async ({ signal }) => (await searchMessages({ q: term, signal })).data.results,
  })

  const openResult = (result: SearchResult) => {
    setOpen(false)
    navigate(`/channels/${result.slug}`, { state: { jumpTo: result.id } })
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2 text-muted-foreground"
        aria-label="Buscar mensagens"
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline">Buscar</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] lg:inline">Ctrl K</kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Buscar mensagens</DialogTitle>
          <DialogDescription className="sr-only">Busque em todos os canais e conversas dos quais você participa</DialogDescription>
          {/* Results come already ranked from the server: no client-side filtering */}
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Buscar em todos os seus canais e conversas..."
            />
            <CommandList className="max-h-[60vh]">
              {term.length < 2 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Digite pelo menos 2 caracteres</p>
              ) : isFetching && !data ? (
                <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                </p>
              ) : (
                <>
                  <CommandEmpty>Nenhuma mensagem encontrada</CommandEmpty>
                  {!!data?.length && (
                    <CommandGroup heading={`${data.length} resultado(s)`}>
                      {data.map(result => (
                        <CommandItem
                          key={result.id}
                          value={result.id}
                          onSelect={() => openResult(result)}
                          className="flex items-start gap-3"
                        >
                          <UserAvatar name={result.author.name} avatarUrl={result.author.avatarUrl} className="mt-0.5 h-7 w-7" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{result.author.name}</span>
                              <span>em</span>
                              {result.type === 'GROUP' && <Hash className="!h-3 !w-3" />}
                              <span className="truncate">{result.title}</span>
                              <span className="ml-auto shrink-0">
                                {new Date(result.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-sm">
                              <Highlighted text={result.snippet} />
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
