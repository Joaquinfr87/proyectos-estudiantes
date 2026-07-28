'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@supabase/supabase-js'
import { FileCode, LogOut, UserRound, LayoutDashboard, Menu, X } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data?.avatar_url) setAvatarUrl(data.avatar_url)
          })
      } else {
        setAvatarUrl(null)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
  }

  return (
    <header className='sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6'>
        <Link
          href='/'
          className='flex items-center gap-2.5 transition-opacity hover:opacity-80'
        >
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm'>
            <FileCode className='h-5 w-5 text-white' />
          </div>
          <div className='flex flex-col'>
            <span className='text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight'>
              Proyectos<span className='text-violet-600'>UPDS</span>
            </span>
            <span className='text-[10px] font-medium text-zinc-500 dark:text-zinc-500 leading-tight'>
              Programación IV
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className='hidden items-center gap-6 md:flex'>
          <Link
            href='/projects'
            className='text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
          >
            Proyectos
          </Link>

          {user ? (
            <>
              <Link
                href='/dashboard'
                className='text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
              >
                Mi Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className='flex items-center gap-2 rounded-full outline-none ring-0 focus:ring-0'>
                  <Avatar className='h-8 w-8 border-2 border-zinc-200 dark:border-zinc-700'>
                    <AvatarImage src={avatarUrl || ''} alt='Avatar' />
                    <AvatarFallback className='bg-violet-100 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'>
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='w-56 rounded-xl border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950'
                >
                  <div className='px-2 py-1.5'>
                    <p className='truncate text-sm font-medium text-zinc-900 dark:text-zinc-50'>
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator className='bg-zinc-200 dark:bg-zinc-800' />
                  <DropdownMenuItem
                    className='flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    render={<Link href='/dashboard' />}
                  >
                    <LayoutDashboard className='h-4 w-4' />
                    Mi Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    render={<Link href='/profile' />}
                  >
                    <UserRound className='h-4 w-4' />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className='bg-zinc-200 dark:bg-zinc-800' />
                  <DropdownMenuItem
                    className='flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50'
                    onClick={handleSignOut}
                  >
                    <LogOut className='h-4 w-4' />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className='flex items-center gap-3'>
              <Button variant='ghost' size='sm' render={<Link href='/login' />}>
                Iniciar Sesión
              </Button>
              <Button size='sm' render={<Link href='/register' />}>
                Registrarse
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className='flex items-center justify-center rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800'
        >
          {mobileOpen ? (
            <X className='h-5 w-5' />
          ) : (
            <Menu className='h-5 w-5' />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className='border-t border-zinc-200 bg-white px-4 pb-4 pt-2 md:hidden dark:border-zinc-800 dark:bg-black'>
          <nav className='flex flex-col gap-1'>
            <Link
              href='/projects'
              onClick={() => setMobileOpen(false)}
              className='rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            >
              Proyectos
            </Link>
            {user ? (
              <>
                <Link
                  href='/dashboard'
                  onClick={() => setMobileOpen(false)}
                  className='rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                >
                  Mi Dashboard
                </Link>
                <Link
                  href='/profile'
                  onClick={() => setMobileOpen(false)}
                  className='rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                >
                  Mi Perfil
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    handleSignOut()
                  }}
                  className='rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50'
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className='flex flex-col gap-2 px-3 pt-2'>
                <Button
                  variant='outline'
                  size='sm'
                  render={<Link href='/login' />}
                  onClick={() => setMobileOpen(false)}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  size='sm'
                  render={<Link href='/register' />}
                  onClick={() => setMobileOpen(false)}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
