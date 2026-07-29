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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://proyectosupds.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ProyectosUPDS - Comparte tus proyectos web',
    template: '%s | ProyectosUPDS',
  },
  description:
    'Plataforma para que estudiantes de la UPDS compartan sus proyectos web de GitHub con la comunidad.',
  applicationName: 'ProyectosUPDS',
  authors: [{ name: 'Joaquin Felipez Rojas' }],
  generator: 'Next.js',
  keywords: [
    'UPDS',
    'proyectos web',
    'estudiantes',
    'programación',
    'GitHub',
    'portafolio',
    'desarrollo web',
    'comunidad',
    'Bolivia',
    'universidad',
    'Programación IV',
  ],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicons/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicons/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'es_BO',
    siteName: 'ProyectosUPDS',
    url: '/',
    title: 'ProyectosUPDS - Comparte tus proyectos web',
    description:
      'Plataforma para que estudiantes de la UPDS compartan sus proyectos web de GitHub con la comunidad.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'ProyectosUPDS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProyectosUPDS - Comparte tus proyectos web',
    description:
      'Plataforma para que estudiantes de la UPDS compartan sus proyectos web de GitHub con la comunidad.',
    images: ['/og-image.png'],
  },
  other: {
    'theme-color': '#7c3aed',
  },
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
            {' · '}
            <a
              href='https://github.com/Joaquinfr87/proyectos-estudiantes'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 font-medium text-zinc-700 underline-offset-2 hover:text-violet-600 hover:underline dark:text-zinc-300 dark:hover:text-violet-400'
            >
              <svg viewBox='0 0 24 24' className='h-3.5 w-3.5' fill='currentColor'>
                <path d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z' />
              </svg>
              Código fuente
            </a>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  )
}
