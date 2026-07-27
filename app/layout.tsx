import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/header'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ProyectosUPDS - Comparte tus proyectos web',
  description:
    'Plataforma para que estudiantes compartan sus proyectos web de GitHub con la comunidad UPDS.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='es'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='min-h-full bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50'>
        <Header />
        <main className='flex-1'>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
