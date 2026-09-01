'use client'

import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  Users,
  Code2,
  ArrowLeft,
  Loader2,
  GitFork,
  Search,
  Eye,
  Heart,
  ArrowUpDown,
} from 'lucide-react'
import { getSubjectById } from '@/lib/actions/subjects'
import type { Subject } from '@/lib/actions/subjects'
import type { Project, Profile } from '@/lib/types'

interface StudentWithProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  github_username: string | null
  project_count: number
}

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [subject, setSubject] = useState<Subject | null>(null)
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [students, setStudents] = useState<StudentWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { id } = await params

      const subjectData = await getSubjectById(id)
      setSubject(subjectData)

      if (subjectData) {
        // Fetch projects in this subject
        const { data: projectsData } = await supabase
          .from('projects')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url,
              github_username
            )
          `)
          .eq('subject_id', id)

        const projectsList = (projectsData as Project[]) || []
        setAllProjects(projectsList)

        // Extract unique students from projects
        const studentMap = new Map<string, StudentWithProfile>()
        projectsList.forEach((project) => {
          const userId = project.user_id
          if (!studentMap.has(userId)) {
            studentMap.set(userId, {
              id: userId,
              full_name: project.profiles?.full_name || null,
              avatar_url: project.profiles?.avatar_url || null,
              github_username: project.profiles?.github_username || null,
              project_count: 1,
            })
          } else {
            const existing = studentMap.get(userId)!
            existing.project_count++
          }
        })

        setStudents(Array.from(studentMap.values()))
      }

      setLoading(false)
    }
    load()
  }, [params])

  // Filter and sort projects
  const projects = useMemo(() => {
    let filtered = allProjects

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tech_stack?.some((t) => t.toLowerCase().includes(q))
      )
    }

    switch (sort) {
      case 'most_visited':
        filtered = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case 'most_liked':
        filtered = [...filtered].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
        break
      case 'oldest':
        filtered = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'az':
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'za':
        filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title))
        break
      default: // newest
        filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return filtered
  }, [allProjects, search, sort])

  if (loading) {
    return (
      <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
        <div className='space-y-4'>
          <div className='h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
          <div className='h-10 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
          <div className='h-5 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
        </div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 text-center'>
        <BookOpen className='mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600' />
        <h2 className='mt-4 text-lg font-semibold'>Materia no encontrada</h2>
        <Button className='mt-4' render={<Link href='/subjects' />}>
          Volver a materias
        </Button>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
      {/* Back */}
      <Link
        href='/subjects'
        className='mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
      >
        <ArrowLeft className='h-4 w-4' />
        Volver a materias
      </Link>

      {/* Subject header */}
      <div className='mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'>
        <div className='h-24 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600' />
        <div className='px-6 pb-6 pt-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50'>
                {subject.name}
              </h1>
              {subject.code && (
                <span className='mt-1 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'>
                  {subject.code}
                </span>
              )}
              {subject.description && (
                <p className='mt-3 text-sm text-zinc-500 dark:text-zinc-400'>
                  {subject.description}
                </p>
              )}
            </div>

            <div className='flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400'>
              <span className='flex items-center gap-1'>
                <Users className='h-4 w-4' />
                {students.length} estudiante{students.length !== 1 ? 's' : ''}
              </span>
              <span className='flex items-center gap-1'>
                <Code2 className='h-4 w-4' />
                {allProjects.length} proyecto{allProjects.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='grid gap-8 lg:grid-cols-3'>
        {/* Projects */}
        <div className='lg:col-span-2'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>
              Proyectos ({projects.length})
            </h2>
          </div>

          {/* Search and Sort */}
          <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setSearch(searchInput)
                  }
                  if (e.key === 'Escape') {
                    setSearchInput('')
                    setSearch('')
                  }
                }}
                placeholder='Buscar por nombre, descripción o tecnología...'
                className='h-10 pl-9'
              />
            </div>
            <Select value={sort} onValueChange={(v) => { if (v) setSort(v) }}>
              <SelectTrigger className='w-full sm:w-48'>
                <ArrowUpDown className='mr-1.5 h-3.5 w-3.5' />
                <SelectValue placeholder='Ordenar' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Más recientes</SelectItem>
                <SelectItem value='oldest'>Más antiguos</SelectItem>
                <SelectItem value='most_visited'>Más visitados</SelectItem>
                <SelectItem value='most_liked'>Más gustados</SelectItem>
                <SelectItem value='az'>A → Z</SelectItem>
                <SelectItem value='za'>Z → A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {search && (
            <div className='mb-4 flex items-center gap-2 text-sm text-zinc-500'>
              Resultados para &quot;{search}&quot;
              <button
                onClick={() => { setSearchInput(''); setSearch('') }}
                className='text-violet-600 hover:text-violet-700 dark:text-violet-400'
              >
                Limpiar
              </button>
            </div>
          )}

          {projects.length > 0 ? (
            <div className='space-y-4'>
              {projects.map((project) => {
                const initials = project.profiles?.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'U'

                return (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <Card className='group transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md dark:hover:border-violet-800'>
                      <CardContent className='p-4'>
                        <div className='flex items-start gap-3'>
                          {project.image_urls && project.image_urls.length > 0 ? (
                            <img
                              src={project.image_urls[0]}
                              alt={project.title}
                              className='h-16 w-24 shrink-0 rounded-lg object-cover'
                            />
                          ) : (
                            <div className='flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800'>
                              <GitFork className='h-6 w-6 text-zinc-300 dark:text-zinc-600' />
                            </div>
                          )}
                          <div className='min-w-0 flex-1'>
                            <h3 className='font-semibold text-zinc-900 transition-colors group-hover:text-violet-600 dark:text-zinc-50 dark:group-hover:text-violet-400'>
                              {project.title}
                            </h3>
                            <p className='mt-1 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400'>
                              {project.description}
                            </p>
                            <div className='mt-2 flex items-center gap-4'>
                              <div className='flex items-center gap-2'>
                                <Avatar className='h-5 w-5'>
                                  <AvatarImage
                                    src={project.profiles?.avatar_url || ''}
                                    alt={project.profiles?.full_name || ''}
                                  />
                                  <AvatarFallback className='bg-violet-100 text-[8px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'>
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className='text-xs text-zinc-400'>
                                  {project.profiles?.full_name || 'Anónimo'}
                                </span>
                              </div>
                              <span className='flex items-center gap-1 text-xs text-zinc-400'>
                                <Eye className='h-3 w-3' />
                                {project.views || 0}
                              </span>
                              <span className='flex items-center gap-1 text-xs text-zinc-400'>
                                <Heart className='h-3 w-3' />
                                {project.vote_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className='rounded-xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800'>
              <Code2 className='mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600' />
              <p className='mt-3 text-sm text-zinc-500'>
                {search
                  ? 'No se encontraron proyectos con esa búsqueda.'
                  : 'Aún no hay proyectos en esta materia.'}
              </p>
              {search && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='mt-3'
                  onClick={() => { setSearchInput(''); setSearch('') }}
                >
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Students sidebar - based on projects */}
        <div>
          <h2 className='mb-4 text-lg font-semibold'>
            Estudiantes ({students.length})
          </h2>
          {students.length > 0 ? (
            <div className='space-y-2'>
              {students.map((student) => {
                const initials = student.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'U'

                return (
                  <Link
                    key={student.id}
                    href={`/profile/${student.id}`}
                    className='flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  >
                    <Avatar className='h-9 w-9'>
                      <AvatarImage
                        src={student.avatar_url || ''}
                        alt={student.full_name || ''}
                      />
                      <AvatarFallback className='bg-violet-100 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium text-zinc-900 dark:text-zinc-50'>
                        {student.full_name || 'Sin nombre'}
                      </p>
                      <p className='text-xs text-zinc-400'>
                        {student.project_count} proyecto{student.project_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className='text-sm text-zinc-400'>
              No hay proyectos en esta materia aún.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
