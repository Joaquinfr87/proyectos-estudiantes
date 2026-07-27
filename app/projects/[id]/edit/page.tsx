import { notFound, redirect } from 'next/navigation'
import { getProjectById } from '@/lib/actions/projects'
import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ProjectForm from '@/components/project-form'
import { Pencil } from 'lucide-react'

export default async function EditProjectPage({
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

  if (!user || user.id !== project.user_id) {
    redirect('/projects')
  }

  return (
    <div className='mx-auto max-w-3xl px-4 py-8 sm:px-6'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>
          Editar Proyecto
        </h1>
        <p className='mt-1 text-zinc-500 dark:text-zinc-400'>
          Actualiza la información de tu proyecto
        </p>
      </div>

      <Card className='border-zinc-200 dark:border-zinc-800'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30'>
              <Pencil className='h-5 w-5 text-violet-600 dark:text-violet-400' />
            </div>
            <div>
              <CardTitle className='text-lg'>Editar</CardTitle>
              <CardDescription>
                Modifica los detalles de &quot;{project.title}&quot;
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProjectForm project={project} />
        </CardContent>
      </Card>
    </div>
  )
}
