'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { deleteProject } from '@/lib/actions/projects'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeleteProjectButton({
  projectId,
}: {
  projectId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    const result = await deleteProject(projectId)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant='outline'
          size='sm'
          className='border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50'
        >
          <Trash2 className='mr-1.5 h-3.5 w-3.5' />
          Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Eliminar Proyecto</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar este proyecto? Esta acción
            no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400'>
            {error}
          </div>
        )}

        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
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
  )
}
