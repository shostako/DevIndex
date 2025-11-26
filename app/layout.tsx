import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { DataInitializer } from '@/components/providers/DataInitializer'

export const metadata: Metadata = {
  title: '悪魔のIT辞典 - 毒舌エンジニア用語集',
  description: '技術用語を皮肉と風刺で学ぶ、エンジニアのための悪魔の辞典',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <DataInitializer>{children}</DataInitializer>
        </ThemeProvider>
      </body>
    </html>
  )
}
