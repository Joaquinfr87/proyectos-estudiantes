'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/link-button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowRight,
  Code2,
  GitFork,
  ExternalLink,
  Calendar,
  Sparkles,
  Search,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ProjectCard from '@/components/project-card'
import ImageCarousel from '@/components/image-carousel'
import ProjectFilters from '@/components/project-filters'
import ProjectPagination from '@/components/project-pagination'
import type { Project } from '@/lib/types'

const ITEMS_PER_PAGE = 12

interface HomeState {
  randomProject: Project | null
  projects: Project[]
  total: number
  totalPages: number
  currentPage: number
  allTechStacks: string[]
  allAuthors: { id: string; full_name: string | null }[]
  loading: boolean
}

function HomeContent() {
  const searchParams = useSearchParams()

  const q = searchParams.get('q') || ''
  const tech = searchParams.get('tech') || ''
  const author = searchParams.get('author') || ''
  const page = Number(searchParams.get('page')) || 1

  const [state, setState] = useState<HomeState>({
    randomProject: null,
    projects: [],
    total: 0,
    totalPages: 0,
    currentPage: page,
    allTechStacks: [],
    allAuthors: [],
    loading: true,
  })

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function fetchData() {
      try {
        const [randomResult, techResult, authorsResult] = await Promise.all([
          supabase.from('projects').select('id').limit(100),
          supabase.from('projects').select('tech_stack'),
          supabase.from('projects').select('user_id'),
        ])

        let randomProject: Project | null = null
        if (randomResult.data && randomResult.data.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * randomResult.data.length
          )
          const randomId = randomResult.data[randomIndex].id
          const { data: randomProj } = await supabase
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
            .eq('id', randomId)
            .single()
          randomProject = randomProj as Project
        }

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

        let projects: Project[] = []
        let total = 0
        let totalPages = 0

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

        const { data: filteredProjects, count, error } = await query
          .order('created_at', { ascending: false })
          .range(from, to)

        if (!error) {
          projects = (filteredProjects as Project[]) || []
          total = count || 0
          totalPages = Math.ceil(total / ITEMS_PER_PAGE)
        }

        if (!cancelled) {
          setState({
            randomProject,
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
        console.error('Error fetching home data:', err)
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }))
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [page, q, tech, author])

  const hasActiveFilters = !!(q || tech || author)

  if (state.loading) {
    return <HomeSkeleton />
  }

  return (
    <div className='flex flex-col'>
      {/* ===== FEATURED PROJECT HERO ===== */}
      {state.randomProject ? (
        <FeaturedHero project={state.randomProject} />
      ) : (
        <EmptyHero />
      )}

      {/* ===== PROJECTS SECTION ===== */}
      <section className='mx-auto w-full max-w-6xl px-4 py-12 sm:px-6'>
        {/* Section header */}
        <div className='mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {hasActiveFilters
                ? 'Resultados de búsqueda'
                : 'Todos los proyectos'}
            </h2>
            <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
              {hasActiveFilters
                ? `${state.total} proyecto${state.total !== 1 ? 's' : ''} encontrado${state.total !== 1 ? 's' : ''}`
                : `Explora ${state.total} proyecto${state.total !== 1 ? 's' : ''} de la comunidad`}
            </p>
          </div>
          <Button
            size='sm'
            className='shrink-0'
            render={<Link href='/projects/new' />}
          >
            <Code2 className='mr-1.5 h-4 w-4' />
            Publicar proyecto
          </Button>
        </div>

        {/* Filters */}
        <div className='mb-8'>
          <ProjectFilters
            allTechStacks={state.allTechStacks}
            allAuthors={state.allAuthors}
          />
        </div>

        {/* Project Grid */}
        {state.projects.length > 0 ? (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {state.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className='rounded-xl border-2 border-dashed border-zinc-200 p-16 text-center dark:border-zinc-800'>
            <Search className='mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600' />
            <h3 className='mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
              No se encontraron proyectos
            </h3>
            <p className='mt-2 text-sm text-zinc-500'>
              {hasActiveFilters
                ? 'Intenta con otros filtros o limpia la búsqueda.'
                : 'Sé el primero en compartir tu proyecto.'}
            </p>
            {hasActiveFilters ? (
              <Button
                variant='outline'
                className='mt-6'
                render={<Link href='/' />}
              >
                Limpiar filtros
              </Button>
            ) : (
              <Button className='mt-6' render={<Link href='/projects/new' />}>
                Publicar Proyecto
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className='mt-10'>
          <ProjectPagination
            currentPage={state.currentPage}
            totalPages={state.totalPages}
            total={state.total}
          />
        </div>
      </section>

      {/* ===== MARKETING SECTION (simplified) ===== */}
      <section className='border-t border-zinc-200 dark:border-zinc-800'>
        <div className='mx-auto max-w-6xl px-4 py-16 sm:px-6'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='text-2xl font-bold tracking-tight'>
              ¿Eres estudiante de UPDS?
            </h2>
            <p className='mt-3 text-zinc-500 dark:text-zinc-400'>
              Comparte tus proyectos web con la comunidad, conecta con otros
              desarrolladores y muestra tu trabajo.
            </p>
            <div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <Button
                size='lg'
                className='h-11 px-6 text-sm'
                render={<Link href='/register' />}
              >
                Crear cuenta gratis
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='h-11 px-6 text-sm'
                render={<Link href='/projects' />}
              >
                Ver proyectos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-zinc-200 dark:border-zinc-800'>
        <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center text-sm text-zinc-400 sm:flex-row sm:text-left'>
          <p>© 2026 ProyectosUPDS. Todos los derechos reservados.</p>
          <p>Hecho con ❤️ por la comunidad UPDS</p>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  )
}

/* ===== LOADING SKELETON ===== */
function HomeSkeleton() {
  return (
    <div className='flex flex-col'>
      {/* Hero skeleton */}
      <section className='border-b border-zinc-200 dark:border-zinc-800'>
        <div className='mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16'>
          <div className='mb-6 h-6 w-40 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800' />
          <div className='grid gap-8 lg:grid-cols-5'>
            <div className='lg:col-span-3 space-y-4'>
              <div className='h-10 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
              <div className='h-5 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
              <div className='h-5 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
              <div className='flex gap-2 mt-4'>
                <div className='h-8 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800' />
                <div className='h-8 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800' />
                <div className='h-8 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800' />
              </div>
            </div>
            <div className='lg:col-span-2'>
              <div className='aspect-[4/3] w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800' />
            </div>
          </div>
        </div>
      </section>

      {/* Projects grid skeleton */}
      <section className='mx-auto w-full max-w-6xl px-4 py-12 sm:px-6'>
        <div className='mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-2'>
            <div className='h-7 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
            <div className='h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800' />
          </div>
        </div>
        <div className='mb-8 h-11 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800' />
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
      </section>
    </div>
  )
}

/* ===== FEATURED PROJECT HERO ===== */
function FeaturedHero({ project }: { project: Project }) {
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
    <section className='relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-violet-50 dark:border-zinc-800 dark:from-zinc-950 dark:via-black dark:to-violet-950/20'>
      {/* Background pattern */}
      <div className='absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]' />

      <div className='relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16'>
        {/* Label */}
        <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/80 px-4 py-1.5 text-xs font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300'>
          <Sparkles className='h-3.5 w-3.5' />
          Proyecto destacado
        </div>

        <div className='grid gap-8 lg:grid-cols-5 lg:items-center'>
          {/* Project info */}
          <div className='lg:col-span-3'>
            <Link
              href={`/projects/${project.id}`}
              className='group inline-block'
            >
              <h1 className='text-3xl font-bold tracking-tight transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400 sm:text-4xl lg:text-5xl'>
                {project.title}
              </h1>
            </Link>

            <p className='mt-4 line-clamp-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg'>
              {project.description}
            </p>

            {/* Author */}
            <div className='mt-6 flex items-center gap-3'>
              <Avatar className='h-10 w-10 border-2 border-zinc-200 dark:border-zinc-700'>
                <AvatarImage
                  src={project.profiles?.avatar_url || ''}
                  alt={project.profiles?.full_name || ''}
                />
                <AvatarFallback className='bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm font-medium text-zinc-900 dark:text-zinc-50'>
                  {project.profiles?.full_name || 'Anónimo'}
                </p>
                <div className='flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400'>
                  <span className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    {date}
                  </span>
                </div>
              </div>
            </div>

            {/* Tech stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className='mt-5 flex flex-wrap gap-2'>
                {project.tech_stack.slice(0, 6).map((tech) => (
                  <Badge
                    key={tech}
                    className='bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-300'
                  >
                    {tech}
                  </Badge>
                ))}
                {project.tech_stack.length > 6 && (
                  <Badge
                    variant='secondary'
                    className='px-3 py-1 text-xs'
                  >
                    +{project.tech_stack.length - 6}
                  </Badge>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className='mt-6 flex flex-wrap gap-3'>
              <LinkButton size='sm' href={`/projects/${project.id}`}>
                Ver proyecto completo
                <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
              </LinkButton>
              <LinkButton
                size='sm'
                variant='outline'
                href={project.github_url}
                external
              >
                <GitFork className='mr-1.5 h-3.5 w-3.5' />
                GitHub
              </LinkButton>
              {project.live_url && (
                <LinkButton
                  size='sm'
                  variant='outline'
                  href={project.live_url}
                  external
                >
                  <ExternalLink className='mr-1.5 h-3.5 w-3.5' />
                  Demo
                </LinkButton>
              )}
            </div>
          </div>

          {/* Project image */}
          <div className='lg:col-span-2'>
            <Link href={`/projects/${project.id}`}>
              {project.image_urls && project.image_urls.length > 0 ? (
                <ImageCarousel
                  images={project.image_urls}
                  alt={project.title}
                />
              ) : (
                <div className='flex aspect-video items-center justify-center rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900'>
                  <Code2 className='h-16 w-16 text-zinc-300 dark:text-zinc-600' />
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== EMPTY HERO (no projects yet) ===== */
function EmptyHero() {
  return (
    <section className='relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800'>
      <div className='absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-violet-950/20 dark:via-black dark:to-indigo-950/20' />
      <div className='absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]' />

      <div className='relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28'>
        <div className='mx-auto max-w-3xl text-center'>
          <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300'>
            <Code2 className='h-3.5 w-3.5' />
            Comunidad de desarrolladores UPDS
          </div>
          <h1 className='bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-100 sm:text-5xl sm:leading-[1.1] lg:text-6xl'>
            Comparte tus proyectos
            <br />
            <span className='bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent'>
              web con la comunidad
            </span>
          </h1>
          <p className='mt-6 text-base leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg sm:leading-8'>
            Una plataforma para que estudiantes de la UPDS publiquen y
            descubran proyectos web. ¡Sé el primero en compartir el tuyo!
          </p>
          <div className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Button
              size='lg'
              className='h-12 px-8 text-base'
              render={<Link href='/register' />}
            >
              Comenzar ahora
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='h-12 px-8 text-base'
              render={<Link href='/projects/new' />}
            >
              Publicar proyecto
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
