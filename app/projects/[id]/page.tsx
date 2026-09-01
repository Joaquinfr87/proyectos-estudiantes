import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectById } from '@/lib/actions/projects'
import { incrementViewCount } from '@/lib/actions/interactions'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ImageCarousel from '@/components/image-carousel'
import VoteButton from '@/components/vote-button'
import {
  GitFork,
  Globe,
  Calendar,
  ArrowLeft,
  Pencil,
  ExternalLink,
} from 'lucide-react'
import DeleteProjectButton from './delete-button'
import RealtimeProjectStats from '@/components/realtime-project-stats'

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='currentColor'>
      <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
    </svg>
  )
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  // Incrementar vista (fire and forget)
  incrementViewCount(id).catch(() => {})

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = user?.id === project.user_id

  const date = new Date(project.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const initials =
    project.profiles?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'

  return (
    <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
      {/* Back button */}
      <Link
        href='/projects'
        className='mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
      >
        <ArrowLeft className='h-4 w-4' />
        Volver a proyectos
      </Link>

      {/* Project Image */}
      {project.image_urls && project.image_urls.length > 0 && (
        <div className='mb-8'>
          <ImageCarousel
            images={project.image_urls}
            alt={project.title}
          />
        </div>
      )}

      {/* Title and Edit Actions */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {project.title}
          </h1>
          <div className='mt-2 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400'>
            <span className='flex items-center gap-1.5'>
              <Calendar className='h-4 w-4' />
              {date}
            </span>
            <RealtimeProjectStats
              projectId={project.id}
              initialViews={project.views || 0}
              initialVoteCount={project.vote_count || 0}
            />
          </div>
        </div>

        {isOwner && (
          <div className='flex shrink-0 items-center gap-2'>
            <Link
              href={`/projects/${project.id}/edit`}
              className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
            >
              <Pencil className='h-4 w-4' />
              Editar
            </Link>
            <DeleteProjectButton projectId={project.id} />
          </div>
        )}
      </div>

      {/* Vote Button */}
      <div className='mb-8'>
        <VoteButton
          projectId={project.id}
          initialVoteCount={project.vote_count || 0}
        />
      </div>

      {/* BIG Link Buttons - GitHub + Demo */}
      <div className='mb-8 flex flex-col gap-3 sm:flex-row'>
        <a
          href={project.github_url}
          target='_blank'
          rel='noopener noreferrer'
          className='group flex items-center gap-3 rounded-xl border-2 border-zinc-900 bg-zinc-900 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl hover:-translate-y-0.5 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
        >
          <GitHubIcon className='h-6 w-6 shrink-0' />
          <span className='flex-1'>Ver código en GitHub</span>
          <ExternalLink className='h-5 w-5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100' />
        </a>

        {project.live_url && (
          <a
            href={project.live_url}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 rounded-xl border-2 border-violet-600 bg-violet-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-violet-700 hover:shadow-xl hover:-translate-y-0.5 dark:border-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500'
          >
            <Globe className='h-6 w-6 shrink-0' />
            <span className='flex-1'>Ver demo en vivo</span>
            <ExternalLink className='h-5 w-5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100' />
          </a>
        )}
      </div>

      {/* Author Info */}
      <Link
        href={`/profile/${project.user_id}`}
        className='mb-8 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-violet-800'
      >
        <Avatar className='h-12 w-12 border-2 border-zinc-200 dark:border-zinc-700'>
          <AvatarImage
            src={project.profiles?.avatar_url || ''}
            alt={project.profiles?.full_name || ''}
          />
          <AvatarFallback className='bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white'>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <p className='font-medium text-zinc-900 transition-colors hover:text-violet-600 dark:text-zinc-50 dark:hover:text-violet-400'>
            {project.profiles?.full_name || 'Anónimo'}
          </p>
          {project.profiles?.github_username && (
            <span
              className='flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400'
            >
              <GitFork className='h-3.5 w-3.5' />
              @{project.profiles.github_username}
            </span>
          )}
        </div>
        <span className='text-xs font-medium text-zinc-400 transition-colors hover:text-violet-600 dark:hover:text-violet-400'>
          Ver perfil
        </span>
      </Link>

      {/* Description */}
      <div className='mb-8'>
        <h2 className='mb-3 text-lg font-semibold'>Descripción</h2>
        <p className='whitespace-pre-line leading-relaxed text-zinc-600 dark:text-zinc-400'>
          {project.description}
        </p>
      </div>

      <Separator className='my-8 bg-zinc-200 dark:bg-zinc-800' />

      {/* Tech Stack */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <div className='mb-8'>
          <h2 className='mb-3 text-lg font-semibold'>Tecnologías</h2>
          <div className='flex flex-wrap gap-2'>
            {project.tech_stack.map((tech) => (
              <Badge
                key={tech}
                className='bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
