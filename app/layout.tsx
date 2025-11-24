import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DevIndex - エンジニア用語学習アプリ',
  description: '技術用語を効率的に学習し、長期記憶に定着させる',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
