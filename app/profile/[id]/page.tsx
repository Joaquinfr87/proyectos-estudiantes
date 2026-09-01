import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ProjectCard from '@/components/project-card'
import {
  ArrowLeft,
  GitFork,
  Calendar,
  Code2,
  ExternalLink,
  GraduationCap,
  BookOpen,
  Wrench,
} from 'lucide-react'
import type { Project } from '@/lib/types'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: projects } = await supabase
    .from('projects')
    .select(
      `
      *,
      profiles:user_id (
        full_name,
        avatar_url,
        github_username
      )
    `
    )
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const projectsList = (projects as Project[]) || []

  const initials = (profile.full_name || '')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const memberSince = new Date(profile.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
      {/* Back button */}
      <Link
        href='/projects'
        className='mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
      >
        <ArrowLeft className='h-4 w-4' />
        Volver a proyectos
      </Link>

      {/* Profile header */}
      <div className='mb-10 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'>
        {/* Banner gradient */}
        <div className='h-32 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600' />

        <div className='relative px-6 pb-6'>
          {/* Avatar */}
          <div className='-mt-16 mb-4 flex justify-start'>
            <Avatar className='h-28 w-28 border-4 border-white shadow-xl dark:border-zinc-950'>
              <AvatarImage
                src={profile.avatar_url || ''}
                alt={profile.full_name || ''}
              />
              <AvatarFallback className='bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white'>
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info */}
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50'>
                {profile.full_name || 'Sin nombre'}
              </h1>

              {profile.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-1.5 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400'
                >
                  <GitFork className='h-4 w-4' />
                  @{profile.github_username}
                  <ExternalLink className='h-3 w-3 opacity-60' />
                </a>
              )}

              <div className='mt-2 flex items-center gap-1.5 text-xs text-zinc-400'>
                <Calendar className='h-3.5 w-3.5' />
                Miembro desde {memberSince}
              </div>
            </div>

            <div className='shrink-0'>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'>
                <Code2 className='h-3.5 w-3.5' />
                {projectsList.length} proyecto{projectsList.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Student info */}
          {(profile.career || profile.semester) && (
            <div className='mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400'>
              {profile.career && (
                <div className='flex items-center gap-1.5'>
                  <BookOpen className='h-4 w-4 text-violet-500' />
                  {profile.career}
                </div>
              )}
              {profile.semester && (
                <div className='flex items-center gap-1.5'>
                  <GraduationCap className='h-4 w-4 text-violet-500' />
                  {profile.semester}
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className='mt-4'>
              <div className='mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400'>
                <Wrench className='h-3.5 w-3.5' />
                Habilidades
              </div>
              <div className='flex flex-wrap gap-2'>
                {profile.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className='inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className='mt-4'>
              <p className='whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-400'>
                {profile.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Projects section */}
      <div>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold tracking-tight'>
              Proyectos de {profile.full_name?.split(' ')[0] || 'este usuario'}
            </h2>
            <p className='mt-0.5 text-sm text-zinc-500 dark:text-zinc-400'>
              {projectsList.length} proyecto{projectsList.length !== 1 ? 's' : ''} publicado{projectsList.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {projectsList.length > 0 ? (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {projectsList.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className='rounded-xl border-2 border-dashed border-zinc-200 p-16 text-center dark:border-zinc-800'>
            <Code2 className='mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600' />
            <h3 className='mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
              Sin proyectos aún
            </h3>
            <p className='mt-2 text-sm text-zinc-500'>
              Este usuario aún no ha publicado ningún proyecto.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
