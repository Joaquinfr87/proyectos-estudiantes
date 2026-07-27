import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ProjectForm from '@/components/project-form'
import { Code2 } from 'lucide-react'

export default function NewProjectPage() {
  return (
    <div className='mx-auto max-w-3xl px-4 py-8 sm:px-6'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>
          Nuevo Proyecto
        </h1>
        <p className='mt-1 text-zinc-500 dark:text-zinc-400'>
          Comparte tu proyecto web con la comunidad
        </p>
      </div>

      <Card className='border-zinc-200 dark:border-zinc-800'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30'>
              <Code2 className='h-5 w-5 text-violet-600 dark:text-violet-400' />
            </div>
            <div>
              <CardTitle className='text-lg'>
                Detalles del Proyecto
              </CardTitle>
              <CardDescription>
                Completa la información sobre tu proyecto web
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProjectForm />
        </CardContent>
      </Card>
    </div>
  )
}
