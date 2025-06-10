import { IndexRoutes } from "./routes"
import { Toaster } from 'sonner'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from "./components/theme-provider"

function App() {
  const client = new QueryClient()
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
