'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { deleteProjectImages } from '@/lib/supabase/storage'
import type { Project } from '@/lib/types'

const ITEMS_PER_PAGE = 12

// Input validation helpers
function sanitizeString(input: string | null, maxLength: number = 1000): string {
  if (!input) return ''
  return input.trim().slice(0, maxLength)
}

function isValidUrl(url: string): boolean {
  if (!url) return true // optional URLs
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

function parseJsonArray(input: string | null, fieldName: string): string[] {
  if (!input) return []
  try {
    const parsed = JSON.parse(input)
    if (!Array.isArray(parsed)) {
      throw new Error(`${fieldName} debe ser un array`)
    }
    // Validate each item is a string and sanitize
    return parsed
      .filter((item): item is string => typeof item === 'string')
      .map((item) => sanitizeString(item, 100))
      .slice(0, 20) // Max 20 items
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error(`Error al procesar ${fieldName}: formato inválido`)
    }
    throw e
  }
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  try {
    const title = sanitizeString(formData.get('title') as string, 200)
    const description = sanitizeString(formData.get('description') as string, 2000)
    const githubUrl = (formData.get('github_url') as string) || ''
    const liveUrl = (formData.get('live_url') as string) || ''
    const techStack = parseJsonArray(formData.get('tech_stack') as string, 'tech_stack')
    const imageUrls = parseJsonArray(formData.get('image_urls') as string, 'image_urls')
    const subjectId = (formData.get('subject_id') as string) || null

    // Validation
    if (!title || title.length < 3) {
      return { error: 'El título debe tener al menos 3 caracteres' }
    }
    if (!description || description.length < 10) {
      return { error: 'La descripción debe tener al menos 10 caracteres' }
    }
    if (!githubUrl) {
      return { error: 'La URL de GitHub es requerida' }
    }
    if (!isValidUrl(githubUrl)) {
      return { error: 'La URL de GitHub no es válida' }
    }
    if (liveUrl && !isValidUrl(liveUrl)) {
      return { error: 'La URL de demo no es válida' }
    }
    if (techStack.length > 15) {
      return { error: 'Máximo 15 tecnologías permitidas' }
    }
    if (imageUrls.length > 5) {
      return { error: 'Máximo 5 imágenes permitidas' }
    }

    // Validate image URLs are from Supabase storage
    for (const url of imageUrls) {
      if (!url.includes('supabase')) {
        return { error: 'URLs de imágenes no válidas' }
      }
    }

    const { error } = await supabase.from('projects').insert({
      title,
      description,
      github_url: githubUrl,
      live_url: liveUrl || null,
      tech_stack: techStack,
      image_urls: imageUrls,
      subject_id: subjectId || null,
      user_id: user.id,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/projects')
    redirect('/projects')
  } catch (e) {
    // Next.js redirect() throws a special error that should propagate
    if (e && typeof e === 'object' && 'digest' in e) {
      throw e
    }
    const message = e instanceof Error ? e.message : 'Error al crear el proyecto'
    return { error: message }
  }
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  try {
    const title = sanitizeString(formData.get('title') as string, 200)
    const description = sanitizeString(formData.get('description') as string, 2000)
    const githubUrl = (formData.get('github_url') as string) || ''
    const liveUrl = (formData.get('live_url') as string) || ''
    const techStack = parseJsonArray(formData.get('tech_stack') as string, 'tech_stack')
    const imageUrls = parseJsonArray(formData.get('image_urls') as string, 'image_urls')
    const subjectId = (formData.get('subject_id') as string) || null

    // Validation
    if (!title || title.length < 3) {
      return { error: 'El título debe tener al menos 3 caracteres' }
    }
    if (!description || description.length < 10) {
      return { error: 'La descripción debe tener al menos 10 caracteres' }
    }
    if (!githubUrl) {
      return { error: 'La URL de GitHub es requerida' }
    }
    if (!isValidUrl(githubUrl)) {
      return { error: 'La URL de GitHub no es válida' }
    }
    if (liveUrl && !isValidUrl(liveUrl)) {
      return { error: 'La URL de demo no es válida' }
    }

    const { error } = await supabase
      .from('projects')
      .update({
        title,
        description,
        github_url: githubUrl,
        live_url: liveUrl || null,
        tech_stack: techStack,
        image_urls: imageUrls,
        subject_id: subjectId || null,
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
  } catch (e) {
    // Next.js redirect() throws a special error that should propagate
    if (e && typeof e === 'object' && 'digest' in e) {
      throw e
    }
    const message = e instanceof Error ? e.message : 'Error al actualizar el proyecto'
    return { error: message }
  }
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
    const sanitizedQ = sanitizeString(filters.q, 100)
    query = query.or(`title.ilike.%${sanitizedQ}%,description.ilike.%${sanitizedQ}%`)
  }

  // Filter by technology
  if (filters.tech) {
    const sanitizedTech = sanitizeString(filters.tech, 100)
    query = query.contains('tech_stack', [sanitizedTech])
  }

  // Filter by author (full_name)
  if (filters.author) {
    const sanitizedAuthor = sanitizeString(filters.author, 100)
    // First find the user IDs with that name
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name', `%${sanitizedAuthor}%`)

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
