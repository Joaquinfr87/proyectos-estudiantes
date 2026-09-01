'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
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
  BookOpen,
  Users,
  Code2,
  Plus,
  Loader2,
  Search,
  GraduationCap,
} from 'lucide-react'
import { getSubjectsWithCounts, createSubject } from '@/lib/actions/subjects'
import type { Subject } from '@/lib/actions/subjects'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
    loadSubjects()
  }, [])

  async function loadSubjects() {
    setLoading(true)
    const data = await getSubjectsWithCounts()
    setSubjects(data)
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createSubject(formData)

    if (result.error) {
      setError(result.error)
      setCreating(false)
    } else {
      if (result.subject) {
        setSubjects([...subjects, result.subject])
      }
      setShowCreateDialog(false)
      setCreating(false)
    }
  }

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchInput.toLowerCase()))
  )

  if (loading) {
    return (
      <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
        <div className='mb-8 space-y-2'>
          <div className='h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
          <div className='h-5 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
        </div>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='h-32 animate-pulse rounded-xl border border-zinc-200 dark:border-zinc-800'
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
      {/* Header */}
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2.5'>
            <BookOpen className='h-6 w-6 text-violet-600' />
            <h1 className='text-2xl font-bold tracking-tight'>Materias</h1>
          </div>
          <p className='mt-1 text-zinc-500 dark:text-zinc-400'>
            {subjects.length} materia{subjects.length !== 1 ? 's' : ''} disponible{subjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        {user && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Nueva Materia
          </Button>
        )}
      </div>

      {/* Search */}
      <div className='mb-8 relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder='Buscar por nombre o código...'
          className='h-12 pl-9'
        />
      </div>

      {/* Subjects grid */}
      {filtered.length > 0 ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((subject) => (
            <Link key={subject.id} href={`/subjects/${subject.id}`}>
              <Card className='group h-full transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg dark:hover:border-violet-800'>
                <CardContent className='p-5'>
                  <div className='flex items-start gap-3'>
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30'>
                      <BookOpen className='h-6 w-6 text-violet-600 dark:text-violet-400' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='font-semibold text-zinc-900 transition-colors group-hover:text-violet-600 dark:text-zinc-50 dark:group-hover:text-violet-400'>
                        {subject.name}
                      </h3>
                      {subject.code && (
                        <span className='text-xs font-medium text-violet-500'>
                          {subject.code}
                        </span>
                      )}
                    </div>
                  </div>

                  {subject.description && (
                    <p className='mt-3 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400'>
                      {subject.description}
                    </p>
                  )}

                  <div className='mt-4 flex items-center gap-4 text-xs text-zinc-400'>
                    <span className='flex items-center gap-1'>
                      <Users className='h-3.5 w-3.5' />
                      {subject.student_count || 0} estudiante{(subject.student_count || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Code2 className='h-3.5 w-3.5' />
                      {subject.project_count || 0} proyecto{(subject.project_count || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className='rounded-xl border-2 border-dashed border-zinc-200 p-16 text-center dark:border-zinc-800'>
          <BookOpen className='mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600' />
          <h3 className='mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
            No se encontraron materias
          </h3>
          <p className='mt-2 text-sm text-zinc-500'>
            {searchInput
              ? 'Intenta con otra búsqueda.'
              : 'Sé el primero en crear una materia.'}
          </p>
          {user && !searchInput && (
            <Button className='mt-6' onClick={() => setShowCreateDialog(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Crear Materia
            </Button>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Crear Materia</DialogTitle>
            <DialogDescription>
              Crea una nueva materia para agrupar proyectos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Nombre *</Label>
              <Input
                id='name'
                name='name'
                placeholder='Ej: Programación Web'
                required
                className='h-10'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='code'>Código (opcional)</Label>
              <Input
                id='code'
                name='code'
                placeholder='Ej: SIS-401'
                className='h-10'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>Descripción (opcional)</Label>
              <Textarea
                id='description'
                name='description'
                placeholder='Describe brevemente la materia...'
                rows={3}
                className='resize-none'
              />
            </div>

            {error && (
              <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400'>
                {error}
              </div>
            )}

            <DialogFooter className='gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creando...
                  </>
                ) : (
                  'Crear Materia'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
