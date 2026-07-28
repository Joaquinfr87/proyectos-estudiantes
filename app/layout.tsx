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
        <footer className='border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-black'>
          <div className='mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500 dark:text-zinc-500 sm:px-6'>
            Creada por{' '}
            <span className='font-medium text-zinc-700 dark:text-zinc-300'>
              Joaquin Felipez Rojas
            </span>{' '}
            para la materia de{' '}
            <span className='font-medium text-violet-600'>
              Programación IV
            </span>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  )
}
