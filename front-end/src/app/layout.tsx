import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pedra Papel Tesoura IA',
  description: 'Jogue Pedra, Papel e Tesoura com IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <head><meta name="languagetool-editor-disabled" content="true" /></head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}