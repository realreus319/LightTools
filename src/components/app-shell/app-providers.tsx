'use client'

import { ThemeProvider } from '@appica/ui-react/providers/theme-provider'
import { ToastProvider, Toaster } from '@appica/ui-react/toast'
import { WebVitalsReporter } from '@/components/observability/web-vitals-reporter'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider timeout={4000}>
        <WebVitalsReporter />
        {children}
        <Toaster position="bottom-center" progress timeout={4000} />
      </ToastProvider>
    </ThemeProvider>
  )
}
