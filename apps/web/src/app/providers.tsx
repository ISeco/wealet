import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ApiError } from '../lib/api/client'
import { AuthProvider } from '../features/auth'
import { AppRouter } from './router'
import { ThemeProvider } from './theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.statusCode < 500) return false
        return failureCount < 3
      },
    },
  },
})

export function AppProviders() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}
