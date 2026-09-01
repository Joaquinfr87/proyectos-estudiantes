'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Search,
  Users,
  GitFork,
  BookOpen,
  GraduationCap,
  Wrench,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()

    async function fetchProfiles() {
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .order('full_name', { ascending: true })

        if (search) {
          query = query.or(
            `full_name.ilike.%${search}%,github_username.ilike.%${search}%,career.ilike.%${search}%`
          )
        }

        const { data, error } = await query

        if (!error && data) {
          setProfiles(data as Profile[])
        }
      } catch (err) {
        console.error('Error fetching profiles:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSearch(searchInput)
  }

  if (loading) {
    return (
      <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
        <div className='mb-8 space-y-2'>
          <div className='h-8 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
          <div className='h-5 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
        </div>
        <div className='mb-8 h-14 w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800' />
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='h-40 animate-pulse rounded-xl border border-zinc-200 dark:border-zinc-800'
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-2.5'>
          <Users className='h-6 w-6 text-violet-600' />
          <h1 className='text-2xl font-bold tracking-tight'>Estudiantes</h1>
        </div>
        <p className='mt-1 text-zinc-500 dark:text-zinc-400'>
          {profiles.length} estudiante{profiles.length !== 1 ? 's' : ''} registrado{profiles.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className='mb-8 relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder='Buscar por nombre, usuario de GitHub o carrera...'
          className='h-12 pl-9 pr-24'
        />
        <div className='absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1'>
          {search && (
            <button
              type='button'
              onClick={() => {
                setSearchInput('')
                setSearch('')
              }}
              className='flex h-9 items-center justify-center rounded-md px-2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            >
              Limpiar
            </button>
          )}
          <Button type='submit' size='sm' className='h-9 px-4'>
            Buscar
          </Button>
        </div>
      </form>

      {/* Profiles grid */}
      {profiles.length > 0 ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {profiles.map((profile) => {
            const initials = (profile.full_name || '')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'U'

            return (
              <Link key={profile.id} href={`/profile/${profile.id}`}>
                <Card className='group h-full transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg dark:hover:border-violet-800'>
                  <CardContent className='p-5'>
                    <div className='flex items-start gap-4'>
                      <Avatar className='h-14 w-14 shrink-0 border-2 border-zinc-200 dark:border-zinc-700'>
                        <AvatarImage
                          src={profile.avatar_url || ''}
                          alt={profile.full_name || ''}
                        />
                        <AvatarFallback className='bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white'>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1'>
                        <h3 className='truncate font-semibold text-zinc-900 transition-colors group-hover:text-violet-600 dark:text-zinc-50 dark:group-hover:text-violet-400'>
                          {profile.full_name || 'Sin nombre'}
                        </h3>
                        {profile.github_username && (
                          <a
                            href={`https://github.com/${profile.github_username}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={(e) => e.stopPropagation()}
                            className='inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400'
                          >
                            <GitFork className='h-3 w-3' />
                            @{profile.github_username}
                            <ExternalLink className='h-2.5 w-2.5 opacity-60' />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Student info */}
                    {(profile.career || profile.semester) && (
                      <div className='mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400'>
                        {profile.career && (
                          <span className='flex items-center gap-1'>
                            <BookOpen className='h-3 w-3 text-violet-500' />
                            {profile.career}
                          </span>
                        )}
                        {profile.semester && (
                          <span className='flex items-center gap-1'>
                            <GraduationCap className='h-3 w-3 text-violet-500' />
                            {profile.semester}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                      <div className='mt-3 flex flex-wrap gap-1.5'>
                        {profile.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className='inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                          >
                            {skill}
                          </span>
                        ))}
                        {profile.skills.length > 4 && (
                          <span className='inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'>
                            +{profile.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bio */}
                    {profile.bio && (
                      <p className='mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500'>
                        {profile.bio}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className='rounded-xl border-2 border-dashed border-zinc-200 p-16 text-center dark:border-zinc-800'>
          <Users className='mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600' />
          <h3 className='mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
            No se encontraron estudiantes
          </h3>
          <p className='mt-2 text-sm text-zinc-500'>
            {search
              ? 'Intenta con otra búsqueda.'
              : 'Sé el primero en registrarte.'}
          </p>
          {search && (
            <Button
              variant='outline'
              className='mt-6'
              onClick={() => {
                setSearchInput('')
                setSearch('')
              }}
            >
              Limpiar búsqueda
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
