import { IndexRoutes } from "./routes"
import { toast, Toaster } from 'sonner'
import { QueryClientProvider, QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { ThemeProvider } from "./components/theme-provider"
import { isAxiosError } from "axios"
import { authSlice } from "./store/auth"

function App() {
  const { signout } = authSlice(state => state)
  const client = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (isAxiosError(error)) {
          if (error && error?.response && error?.response.status >= 500) {
            toast.error('A server error occurred. Please try again later.');
          }

          else if (error && error.response && error.response.status === 401) {
            toast.error(error.response.data.error);
            signout()
          } else {
            toast.error('Something went wrong with fetching data.');
          }
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        // This callback will be fired for all failed mutations
        console.error('Global Mutation Error:', error);

        if (mutation.options.onError) {
          return;
        }
      },
    }),
    defaultOptions: {
      queries: {
        retry: 3,
      },
      mutations: {
        retry: 0,
      },
    },
  })


  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <Toaster richColors />
        <IndexRoutes />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
