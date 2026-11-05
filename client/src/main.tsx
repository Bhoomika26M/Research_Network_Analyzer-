import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const TOKEN_KEY = 'Scientific Network_token'
const USER_KEY = 'Scientific Network_user'
const LOGIN_TIME_KEY = 'Scientific Network_login_time'

function handleAdminHash() {
  if (window.location.hash === '#admin') {
    const hadSession = localStorage.getItem(TOKEN_KEY) != null
    if (hadSession) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(LOGIN_TIME_KEY)
      window.location.reload()
    }
  }
}

handleAdminHash()
window.addEventListener('hashchange', handleAdminHash)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
