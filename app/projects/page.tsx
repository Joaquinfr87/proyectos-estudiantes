'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  X,
  RefreshCw,
  Plus,
  LayoutGrid,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ProjectCard from '@/components/project-card'
import ProjectPagination from '@/components/project-pagination'
import type { Project } from '@/lib/types'

const ITEMS_PER_PAGE = 12

interface ProjectsState {
  projects: Project[]
  total: number
  totalPages: number
  currentPage: number
  allTechStacks: string[]
  allAuthors: { id: string; full_name: string | null }[]
  loading: boolean
}

function ProjectsContent() {
  const searchParams = useSearchParams()

  const q = searchParams.get('q') || ''
  const tech = searchParams.get('tech') || ''
  const author = searchParams.get('author') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page')) || 1

  const [state, setState] = useState<ProjectsState>({
    projects: [],
    total: 0,
    totalPages: 0,
    currentPage: page,
    allTechStacks: [],
    allAuthors: [],
    loading: true,
  })
  const [searchInput, setSearchInput] = useState(q)

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      if (!('page' in updates)) {
        params.delete('page')
      }
      return params.toString()
    },
    [searchParams]
  )

  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function fetchData() {
      try {
        const [techResult, authorsResult] = await Promise.all([
          supabase.from('projects').select('tech_stack'),
          supabase.from('projects').select('user_id'),
        ])

        let allTechStacks: string[] = []
        if (techResult.data) {
          const allTechs = new Set<string>()
          techResult.data.forEach((project) =>
            project.tech_stack?.forEach((t: string) => allTechs.add(t))
          )
          allTechStacks = Array.from(allTechs).sort()
        }

        let allAuthors: { id: string; full_name: string | null }[] = []
        if (authorsResult.data) {
          const userIds = [
            ...new Set(authorsResult.data.map((p) => p.user_id)),
          ]
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds)
            .order('full_name', { ascending: true })
          allAuthors =
            profiles?.map((p) => ({ id: p.id, full_name: p.full_name })) || []
        }

        const from = (page - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        let query = supabase
          .from('projects')
          .select(
            `
            *,
            profiles:user_id (
              full_name,
              avatar_url,
              github_username
            )
          `,
            { count: 'exact' }
          )

        if (q) {
          query = query.or(
            `title.ilike.%${q}%,description.ilike.%${q}%`
          )
        }

        if (tech) {
          query = query.contains('tech_stack', [tech])
        }

        if (author) {
          const { data: authorProfiles } = await supabase
            .from('profiles')
            .select('id')
            .ilike('full_name', `%${author}%`)

          if (authorProfiles && authorProfiles.length > 0) {
            const authorIds = authorProfiles.map((p) => p.id)
            query = query.in('user_id', authorIds)
          }
        }

        let orderColumn = 'created_at'
        let orderAsc = false
        if (sort === 'oldest') {
          orderColumn = 'created_at'
          orderAsc = true
        } else if (sort === 'az') {
          orderColumn = 'title'
          orderAsc = true
        } else if (sort === 'za') {
          orderColumn = 'title'
          orderAsc = false
        }

        const { data: filteredProjects, count, error } = await query
          .order(orderColumn, { ascending: orderAsc })
          .range(from, to)

        let projects: Project[] = []
        let total = 0
        let totalPages = 0

        if (!error) {
          projects = (filteredProjects as Project[]) || []
          total = count || 0
          totalPages = Math.ceil(total / ITEMS_PER_PAGE)
        }

        if (!cancelled) {
          setState({
            projects,
            total,
            totalPages,
            currentPage: page,
            allTechStacks,
            allAuthors,
            loading: false,
          })
        }
      } catch (err) {
        console.error('Error fetching projects:', err)
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }))
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [page, q, tech, author, sort])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/projects?${createQueryString({ q: searchInput || null })}`)
  }

  const handleSortChange = (value: string | null) => {
    router.push(`/projects?${createQueryString({ sort: value === 'newest' ? null : value })}`)
  }

  const handleTechChange = (value: string | null) => {
    router.push(`/projects?${createQueryString({ tech: value === 'all' || !value ? null : value })}`)
  }

  const handleAuthorChange = (value: string | null) => {
    router.push(`/projects?${createQueryString({ author: value === 'all' || !value ? null : value })}`)
  }

  const clearFilters = () => {
    setSearchInput('')
    router.push('/projects')
  }

  const hasFilters = !!(q || tech || author)

  return (
    <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
      {/* Header */}
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Catálogo de Proyectos</h1>
          <p className='mt-1 text-zinc-500 dark:text-zinc-400'>
            {state.total} proyecto{state.total !== 1 ? 's' : ''} compartido{state.total !== 1 ? 's' : ''} por la comunidad
          </p>
        </div>
        <Button className='shrink-0' render={<Link href='/projects/new' />}>
          <Plus className='mr-2 h-4 w-4' />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Filters bar */}
      <div className='mb-8 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50'>
        <div className='flex items-center gap-2 mb-3 text-sm font-medium text-zinc-600 dark:text-zinc-400'>
          <SlidersHorizontal className='h-4 w-4' />
          Filtros
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className='relative mb-3'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Buscar por nombre o descripción...'
            className='h-10 pl-9 pr-20 bg-white dark:bg-zinc-950'
          />
          <div className='absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1'>
            {q && (
              <button
                type='button'
                onClick={() => {
                  setSearchInput('')
                  router.push(`/projects?${createQueryString({ q: null })}`)
                }}
                className='flex h-8 items-center justify-center rounded-md px-2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
            <Button type='submit' size='sm' className='h-8 px-3 text-xs'>
              Buscar
            </Button>
          </div>
        </form>

        {/* Dropdowns */}
        <div className='flex flex-wrap items-center gap-3'>
          <div className='w-full sm:w-44'>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className='h-9 text-sm bg-white dark:bg-zinc-950'>
                <ArrowUpDown className='mr-1.5 h-3.5 w-3.5' />
                <SelectValue placeholder='Ordenar por' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Más recientes</SelectItem>
                <SelectItem value='oldest'>Más antiguos</SelectItem>
                <SelectItem value='az'>A → Z</SelectItem>
                <SelectItem value='za'>Z → A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='w-full sm:w-44'>
            <Select value={tech || 'all'} onValueChange={handleTechChange}>
              <SelectTrigger className='h-9 text-sm bg-white dark:bg-zinc-950'>
                <SelectValue placeholder='Tecnología' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todas las tecnologías</SelectItem>
                {state.allTechStacks.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='w-full sm:w-44'>
            <Select value={author || 'all'} onValueChange={handleAuthorChange}>
              <SelectTrigger className='h-9 text-sm bg-white dark:bg-zinc-950'>
                <SelectValue placeholder='Autor' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos los autores</SelectItem>
                {state.allAuthors.map((a) => (
                  <SelectItem key={a.id} value={a.full_name || ''}>
                    {a.full_name || 'Anónimo'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              className='h-9 gap-1.5 text-xs text-zinc-500'
            >
              <RefreshCw className='h-3.5 w-3.5' />
              Limpiar
            </Button>
          )}
        </div>

        {/* Active filter badges */}
        {hasFilters && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {q && (
              <Badge variant='secondary' className='gap-1.5 text-xs'>
                Búsqueda: &quot;{q}&quot;
                <button
                  onClick={() => {
                    setSearchInput('')
                    router.push(`/projects?${createQueryString({ q: null })}`)
                  }}
                  className='ml-0.5 rounded-full p-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            )}
            {tech && (
              <Badge variant='secondary' className='gap-1.5 text-xs'>
                {tech}
                <button
                  onClick={() =>
                    router.push(`/projects?${createQueryString({ tech: null })}`)
                  }
                  className='ml-0.5 rounded-full p-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            )}
            {author && (
              <Badge variant='secondary' className='gap-1.5 text-xs'>
                {author}
                <button
                  onClick={() =>
                    router.push(`/projects?${createQueryString({ author: null })}`)
                  }
                  className='ml-0.5 rounded-full p-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {state.loading ? (
        <ProjectsSkeleton />
      ) : state.projects.length > 0 ? (
        <>
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {state.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className='mt-10'>
            <ProjectPagination
              currentPage={state.currentPage}
              totalPages={state.totalPages}
              total={state.total}
            />
          </div>
        </>
      ) : (
        <div className='rounded-xl border-2 border-dashed border-zinc-200 p-16 text-center dark:border-zinc-800'>
          <Search className='mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600' />
          <h3 className='mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
            No se encontraron proyectos
          </h3>
          <p className='mt-2 text-sm text-zinc-500'>
            {hasFilters
              ? 'Intenta con otros filtros o limpia la búsqueda.'
              : 'Sé el primero en compartir tu proyecto.'}
          </p>
          {hasFilters ? (
            <Button variant='outline' className='mt-6' onClick={clearFilters}>
              Limpiar filtros
            </Button>
          ) : (
            <Button className='mt-6' render={<Link href='/projects/new' />}>
              Publicar Proyecto
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsContent />
    </Suspense>
  )
}

function ProjectsSkeleton() {
  return (
    <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
      <div className='mb-8 space-y-2'>
        <div className='h-8 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
        <div className='h-5 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
      </div>
      <div className='mb-8 h-24 w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800' />
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className='overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800'
          >
            <div className='aspect-video w-full animate-pulse bg-zinc-200 dark:bg-zinc-800' />
            <div className='space-y-3 p-4'>
              <div className='h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
              <div className='h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
              <div className='h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
              <div className='flex gap-2'>
                <div className='h-6 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800' />
                <div className='h-6 w-12 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
