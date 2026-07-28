'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus,
  Pencil,
  Trash2,
  GitFork,
  ExternalLink,
  Loader2,
  LayoutDashboard,
} from 'lucide-react'
import { deleteProject } from '@/lib/actions/projects'
import type { Project } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setProjects((data as Project[]) || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    setDeleteError(null)

    const result = await deleteProject(deleteId)

    if (result?.error) {
      setDeleteError(result.error)
      setDeleting(false)
    } else {
      setProjects(projects.filter((p) => p.id !== deleteId))
      setDeleteId(null)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-400' />
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='flex items-center gap-2.5'>
            <LayoutDashboard className='h-6 w-6 text-violet-600' />
            <h1 className='text-2xl font-bold tracking-tight'>Mi Dashboard</h1>
          </div>
          <p className='mt-1 text-zinc-500 dark:text-zinc-400'>
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''} publicado{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button render={<Link href='/projects/new' />}>
          <Plus className='mr-2 h-4 w-4' />
          Nuevo Proyecto
        </Button>
      </div>

      {projects.length > 0 ? (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {projects.map((project) => (
            <Card
              key={project.id}
              className='group overflow-hidden border-zinc-200 bg-white transition-all hover:border-violet-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-violet-800'
            >
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
                <Link
                  href={`/projects/${project.id}`}
                  className='font-semibold text-zinc-900 transition-colors hover:text-violet-600 dark:text-zinc-50 dark:hover:text-violet-400'
                >
                  <h3 className='line-clamp-1 text-base'>{project.title}</h3>
                </Link>
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
                      {project.profiles?.full_name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-xs text-zinc-500 dark:text-zinc-400'>
                    {new Date(project.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className='flex items-center gap-1'>
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'
                    >
                      <ExternalLink className='h-4 w-4' />
                    </a>
                  )}
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    render={<Link href={`/projects/${project.id}/edit`} />}
                  >
                    <Pencil className='h-3.5 w-3.5' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    className='text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50'
                    onClick={() => setDeleteId(project.id)}
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className='rounded-xl border-2 border-dashed border-zinc-200 p-16 text-center dark:border-zinc-800'>
          <GitFork className='mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600' />
          <h3 className='mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
            No tienes proyectos aún
          </h3>
          <p className='mt-2 text-sm text-zinc-500'>
            Publica tu primer proyecto para mostrarlo a la comunidad.
          </p>
          <Button className='mt-6' render={<Link href='/projects/new' />}>
            <Plus className='mr-2 h-4 w-4' />
            Publicar Proyecto
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Eliminar Proyecto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este proyecto? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400'>
              {deleteError}
            </div>
          )}

          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
