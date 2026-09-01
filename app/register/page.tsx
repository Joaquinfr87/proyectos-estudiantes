'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    let ignore = false
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!ignore) {
        router.replace(user ? '/dashboard' : '/login')
      }
    })
    return () => {
      ignore = true
    }
  }, [router])

  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-zinc-400' />
    </div>
  )
}
