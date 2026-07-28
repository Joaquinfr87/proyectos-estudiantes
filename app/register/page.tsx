'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { signUp } from '@/lib/actions/auth'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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
    return () => { ignore = true }
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    const result = await signUp(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (checkingAuth) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-400' />
      </div>
    )
  }

  if (success) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12'>
        <Card className='w-full max-w-md border-zinc-200 shadow-xl dark:border-zinc-800'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
              <svg
                className='h-6 w-6 text-green-600 dark:text-green-400'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={2}
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M4.5 12.75l6 6 9-13.5'
                />
              </svg>
            </div>
            <CardTitle className='text-xl'>¡Registro Exitoso!</CardTitle>
            <CardDescription className='mt-2'>
              Revisa tu correo electrónico para confirmar tu cuenta. Luego
              podrás iniciar sesión.
            </CardDescription>
          </CardHeader>
          <CardFooter className='justify-center border-t border-zinc-200 pt-4 dark:border-zinc-800'>
            <Button variant='outline' render={<Link href='/login' />}>
              Ir a Iniciar Sesión
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12'>
      <Card className='w-full max-w-md border-zinc-200 shadow-xl dark:border-zinc-800'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='text-2xl font-bold tracking-tight'>
            Crear Cuenta
          </CardTitle>
          <CardDescription className='text-zinc-500 dark:text-zinc-400'>
            Registrate para compartir tus proyectos con la comunidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='full_name'>Nombre Completo</Label>
              <Input
                id='full_name'
                name='full_name'
                placeholder='Ej: Juan Pérez'
                required
                className='h-10'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='tu@email.com'
                required
                className='h-10'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Contraseña</Label>
              <div className='relative'>
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Mínimo 6 caracteres'
                  required
                  minLength={6}
                  className='h-10 pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirm_password'>Confirmar Contraseña</Label>
              <Input
                id='confirm_password'
                name='confirm_password'
                type='password'
                placeholder='Repite la contraseña'
                required
                className='h-10'
              />
            </div>

            {error && (
              <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400'>
                {error}
              </div>
            )}

            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='justify-center border-t border-zinc-200 pt-4 dark:border-zinc-800'>
          <p className='text-sm text-zinc-500 dark:text-zinc-400'>
            ¿Ya tienes cuenta?{' '}
            <Link
              href='/login'
              className='font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300'
            >
              Iniciar Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
