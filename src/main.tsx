// ============================================================
// ESTATE HUB — ENTRY POINT
// src/main.tsx
// ============================================================

import { StrictMode, } from 'react'
import { createRoot }         from 'react-dom/client'
import { RouterProvider }     from 'react-router-dom'
import { Provider }           from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster }            from 'react-hot-toast'

import { store }   from '@/store/store'
import { router }  from '@/router'
import '@/index.css'

// ── React Query client ────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:        5 * 60 * 1000,  // 5 min
      retry:            1,
      refetchOnWindowFocus: false,
    },
  },
})

// ── Root render ───────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: '"Nunito Sans", system-ui, sans-serif',
              fontSize:   '0.875rem',
              fontWeight: '500',
              background: '#FFFFFF',
              color:      '#1C1A17',
              border:     '1px solid #E4D9CC',
              borderRadius: '0.75rem',
              boxShadow:  '0 8px 24px rgba(90, 60, 30, 0.12)',
            },
            success: {
              iconTheme: { primary: '#2E7D5B', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#C0392B', secondary: '#FFFFFF' },
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)