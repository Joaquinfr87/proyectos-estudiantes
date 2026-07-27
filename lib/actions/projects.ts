'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { deleteProjectImages } from '@/lib/supabase/storage'
import type { Project } from '@/lib/types'

const ITEMS_PER_PAGE = 12

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const githubUrl = formData.get('github_url') as string
  const liveUrl = formData.get('live_url') as string
  const techStack = JSON.parse(
    (formData.get('tech_stack') as string) || '[]'
  ) as string[]
  const imageUrls = JSON.parse(
    (formData.get('image_urls') as string) || '[]'
  ) as string[]

  const { error } = await supabase.from('projects').insert({
    title,
    description,
    github_url: githubUrl,
    live_url: liveUrl || null,
    tech_stack: techStack,
    image_urls: imageUrls,
    user_id: user.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  redirect('/projects')
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const githubUrl = formData.get('github_url') as string
  const liveUrl = formData.get('live_url') as string
  const techStack = JSON.parse(
    (formData.get('tech_stack') as string) || '[]'
  ) as string[]
  const imageUrls = JSON.parse(
    (formData.get('image_urls') as string) || '[]'
  ) as string[]

  const { error } = await supabase
    .from('projects')
    .update({
      title,
      description,
      github_url: githubUrl,
      live_url: liveUrl || null,
      tech_stack: techStack,
      image_urls: imageUrls,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
  redirect('/projects')
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // Delete project images from storage
  await deleteProjectImages(user.id, projectId)

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  redirect('/projects')
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()

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
    .order('created_at', { ascending: false })

  return (data as Project[]) || []
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createClient()

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
    .eq('id', id)
    .single()

  return data as Project | null
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const supabase = await createClient()

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
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data as Project[]) || []
}

// ----- SSR QUERIES FOR HOME PAGE -----

export async function getRandomProject(): Promise<Project | null> {
  const supabase = await createClient()

  // Primero obtenemos todos los IDs de proyectos (máx 100 para rendimiento)
  const { data: allProjects } = await supabase
    .from('projects')
    .select('id')
    .limit(100)

  if (!allProjects || allProjects.length === 0) return null

  // Elegimos uno aleatorio
  const randomIndex = Math.floor(Math.random() * allProjects.length)
  const randomId = allProjects[randomIndex].id

  const { data: randomProject } = await supabase
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

  return randomProject as Project
}

export interface ProjectFilters {
  q?: string
  tech?: string
  author?: string
  page?: number
  perPage?: number
}

export interface PaginatedResult {
  projects: Project[]
  total: number
  totalPages: number
  currentPage: number
}

export async function getFilteredProjects(
  filters: ProjectFilters = {}
): Promise<PaginatedResult> {
  const supabase = await createClient()
  const page = filters.page || 1
  const perPage = filters.perPage || ITEMS_PER_PAGE
  const from = (page - 1) * perPage
  const to = from + perPage - 1

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

  // Filter by search query (title or description)
  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`)
  }

  // Filter by technology
  if (filters.tech) {
    query = query.contains('tech_stack', [filters.tech])
  }

  // Filter by author (full_name)
  if (filters.author) {
    // First find the user IDs with that name
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name', `%${filters.author}%`)

    if (profiles && profiles.length > 0) {
      const userIds = profiles.map((p) => p.id)
      query = query.in('user_id', userIds)
    } else {
      // No matching authors, return empty
      return { projects: [], total: 0, totalPages: 0, currentPage: page }
    }
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching filtered projects:', error)
    return { projects: [], total: 0, totalPages: 0, currentPage: page }
  }

  const total = count || 0
  const totalPages = Math.ceil(total / perPage)

  return {
    projects: (data as Project[]) || [],
    total,
    totalPages,
    currentPage: page,
  }
}

export async function getAllTechStacks(): Promise<string[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('projects')
    .select('tech_stack')

  if (!data) return []

  // Flatten all tech stacks and get unique values
  const allTechs = new Set<string>()
  data.forEach((project) => {
    project.tech_stack?.forEach((tech: string) => allTechs.add(tech))
  })

  return Array.from(allTechs).sort()
}

export async function getAllAuthors(): Promise<{ id: string; full_name: string | null }[]> {
  const supabase = await createClient()

  // Get authors who have projects
  const { data } = await supabase
    .from('projects')
    .select('user_id')

  if (!data) return []

  const userIds = [...new Set(data.map((p) => p.user_id))]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)
    .order('full_name', { ascending: true })

  return (
    profiles?.map((p) => ({ id: p.id, full_name: p.full_name })) || []
  )
}
