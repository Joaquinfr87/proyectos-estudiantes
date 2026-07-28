import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectById } from '@/lib/actions/projects'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/link-button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ImageCarousel from '@/components/image-carousel'
import {
  GitFork,
  Globe,
  Calendar,
  ArrowLeft,
  Pencil,
  ExternalLink,
} from 'lucide-react'
import DeleteProjectButton from './delete-button'

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
    <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6'>
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

      {/* Title and Actions */}
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
          </div>
        </div>

        {isOwner && (
          <div className='flex shrink-0 items-center gap-2'>
            <Button variant='outline' size='sm' render={<Link href={`/projects/${project.id}/edit`} />}>
              <Pencil className='mr-1.5 h-3.5 w-3.5' />
              Editar
            </Button>
            <DeleteProjectButton projectId={project.id} />
          </div>
        )}
      </div>

      {/* Author Info */}
      <div className='mb-8 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'>
        <Avatar className='h-12 w-12 border-2 border-zinc-200 dark:border-zinc-700'>
          <AvatarImage
            src={project.profiles?.avatar_url || ''}
            alt={project.profiles?.full_name || ''}
          />
          <AvatarFallback className='bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white'>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className='font-medium text-zinc-900 dark:text-zinc-50'>
            {project.profiles?.full_name || 'Anónimo'}
          </p>
          {project.profiles?.github_username && (
            <Link
              href={`https://github.com/${project.profiles.github_username}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400'
            >
              <GitFork className='h-3.5 w-3.5' />
              @{project.profiles.github_username}
            </Link>
          )}
        </div>
      </div>

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

      {/* Links */}
      <div className='mb-8'>
        <h2 className='mb-3 text-lg font-semibold'>Enlaces</h2>
        <div className='flex flex-wrap gap-3'>                  <LinkButton variant='outline' href={project.github_url} external>
                    <GitFork className='mr-2 h-4 w-4' />
                    Ver en GitHub
                    <ExternalLink className='ml-2 h-3 w-3' />
                  </LinkButton>
          {project.live_url && (
            <LinkButton variant='outline' href={project.live_url} external>
              <Globe className='mr-2 h-4 w-4' />
              Demo en vivo
              <ExternalLink className='ml-2 h-3 w-3' />
            </LinkButton>
          )}
        </div>
      </div>
    </div>
  )
}
