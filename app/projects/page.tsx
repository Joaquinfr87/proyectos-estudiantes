import { getProjects } from '@/lib/actions/projects'
import ProjectCard from '@/components/project-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Proyectos</h1>
          <p className='mt-1 text-zinc-500 dark:text-zinc-400'>
            {projects.length} proyecto
            {projects.length !== 1 ? 's' : ''} compartido
            {projects.length !== 1 ? 's' : ''} por la comunidad
          </p>
        </div>
        <Button className='shrink-0' render={<Link href='/projects/new' />}>
          <Plus className='mr-2 h-4 w-4' />
          Nuevo Proyecto
        </Button>
      </div>

      {projects.length > 0 ? (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className='mt-12 rounded-lg border-2 border-dashed border-zinc-200 p-16 text-center dark:border-zinc-800'>
          <Search className='mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-600' />
          <h2 className='mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50'>
            No hay proyectos aún
          </h2>
          <p className='mt-3 text-zinc-500 dark:text-zinc-400'>
            Sé el primero en compartir tu proyecto con la comunidad.
          </p>
          <Button className='mt-8' size='lg' render={<Link href='/projects/new' />}>
            <Plus className='mr-2 h-4 w-4' />
            Publicar Proyecto
          </Button>
        </div>
      )}
    </div>
  )
}
