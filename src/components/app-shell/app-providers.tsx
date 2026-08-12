'use client'

import { ThemeProvider } from '@appica/ui-react/providers/theme-provider'
import { ToastProvider, Toaster } from '@appica/ui-react/toast'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider timeout={4000}>
        {children}
        <Toaster position="bottom-center" progress timeout={4000} />
      </ToastProvider>
    </ThemeProvider>
  )
}
