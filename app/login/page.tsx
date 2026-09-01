'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import OAuthButtons from '@/components/oauth-buttons'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    let ignore = false
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/dashboard')
      } else if (!ignore) {
        setCheckingAuth(false)
      }
    })
    return () => {
      ignore = true
    }
  }, [router])

  if (checkingAuth) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-400' />
      </div>
    )
  }

  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12'>
      <Card className='w-full max-w-md border-zinc-200 shadow-xl dark:border-zinc-800'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='text-2xl font-bold tracking-tight'>
            Iniciar Sesión
          </CardTitle>
          <CardDescription className='text-zinc-500 dark:text-zinc-400'>
            Ingresa con tu cuenta de GitHub para compartir tus proyectos
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400'>
              {error}
            </div>
          )}
          <OAuthButtons onError={setError} />
        </CardContent>
      </Card>
    </div>
  )
}
