'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import type { Project } from '@/lib/types'
import {  GitFork, ExternalLink, Calendar, ChevronRight } from 'lucide-react'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const date = new Date(project.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
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
    <Card className='group overflow-hidden border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-violet-800'>
      {/* Project Image */}
      <Link href={`/projects/${project.id}`}>
        <div className='relative aspect-video w-full overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900'>
          {project.image_urls && project.image_urls.length > 0 ? (
            <img
              src={project.image_urls[0]}
              alt={project.title}
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
            />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <GitFork className='h-12 w-12 text-zinc-300 dark:text-zinc-600' />
            </div>
          )}
        </div>
      </Link>

      <CardHeader className='p-4 pb-0'>
        <div className='flex items-start justify-between gap-2'>
          <Link
            href={`/projects/${project.id}`}
            className='font-semibold text-zinc-900 transition-colors hover:text-violet-600 dark:text-zinc-50 dark:hover:text-violet-400'
          >
            <h3 className='line-clamp-1 text-base'>{project.title}</h3>
          </Link>
        </div>
      </CardHeader>

      <CardContent className='p-4 pb-2'>
        <p className='line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400'>
          {project.description}
        </p>

        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-1.5'>
            {project.tech_stack.slice(0, 4).map((tech) => (
              <Badge
                key={tech}
                variant='secondary'
                className='bg-zinc-100 text-xs font-normal text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              >
                {tech}
              </Badge>
            ))}
            {project.tech_stack.length > 4 && (
              <Badge
                variant='secondary'
                className='bg-zinc-100 text-xs font-normal text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
              >
                +{project.tech_stack.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className='flex items-center justify-between p-4 pt-2'>
        <div className='flex items-center gap-2'>
          <Avatar className='h-6 w-6'>
            <AvatarImage
              src={project.profiles?.avatar_url || ''}
              alt={project.profiles?.full_name || ''}
            />
            <AvatarFallback className='bg-violet-100 text-[10px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className='text-xs text-zinc-500 dark:text-zinc-400'>
            {project.profiles?.full_name || 'Anónimo'}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <Link
            href={project.github_url}
            target='_blank'
            rel='noopener noreferrer'
            className='rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'
            onClick={(e) => e.stopPropagation()}
          >
            <GitFork className='h-4 w-4' />
          </Link>
          {project.live_url && (
            <Link
              href={project.live_url}
              target='_blank'
              rel='noopener noreferrer'
              className='rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className='h-4 w-4' />
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
