import { IndexRoutes } from "./routes"
import { toast, Toaster } from 'sonner'
import { QueryClientProvider, QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { ThemeProvider } from "./components/theme-provider"
import { TooltipProvider } from "./components/ui/tooltip"
import { isAxiosError } from "axios"
import { authSlice } from "./store/auth"

// Created once: recreating it on every render would throw the whole cache away
const client = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (!isAxiosError(error)) return
        const status = error.response?.status

        // The API client already tried to refresh the session: it is really over
        if (status === 401) return authSlice.getState().signout()
        // Forbidden / not found are answers, not failures: each screen renders its own state for them
        if (status === 403 || status === 404) return

        // Fixed ids: several queries failing together show one toast, not a stack
        if (status && status >= 500) toast.error('O servidor encontrou um erro. Tente novamente em instantes.', { id: 'query-error-server' })
        else toast.error('Não foi possível carregar os dados. Confira sua conexão.', { id: 'query-error' })
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // This callback will be fired for all failed mutations
        console.error('Global Mutation Error:', error);

        if (mutation.options.onError) {
          return;
        }
      },
    }),
    defaultOptions: {
      queries: {
        // 4xx answers (forbidden, not found, validation) will not get better by retrying
        retry: (failureCount, error) =>
          failureCount < 3 && !(isAxiosError(error) && error.response && error.response.status < 500),
      },
      mutations: {
        retry: 0,
      },
    },
  })

function App() {

  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <TooltipProvider delayDuration={300}>
          <Toaster richColors />
          <IndexRoutes />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
