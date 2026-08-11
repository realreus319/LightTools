import type { Metadata } from 'next'
import { ThemeProvider } from '@appica/ui-react/providers/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'LightTools · 轻工具',
    template: '%s · LightTools',
  },
  description: '打开即用、尽量在浏览器本地完成处理的现代在线工具箱。',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
