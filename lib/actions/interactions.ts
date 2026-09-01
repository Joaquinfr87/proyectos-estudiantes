'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Incrementa el contador de vistas de un proyecto.
 * Usa una función SQL para incrementar atómicamente.
 */
export async function incrementViewCount(projectId: string): Promise<void> {
  const supabase = await createClient()

  await supabase.rpc('increment_project_views', { p_project_id: projectId })
}

/**
 * Vota por un proyecto. Solo usuarios autenticados.
 * Retorna { success, voteCount } o { error }.
 */
export async function voteProject(
  projectId: string
): Promise<{ success?: boolean; voteCount?: number; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesión para votar' }
  }

  // Verificar si ya votó
  const { data: existingVote } = await supabase
    .from('project_votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .single()

  if (existingVote) {
    return { error: 'Ya has votado por este proyecto' }
  }

  // Insertar voto
  const { error } = await supabase.from('project_votes').insert({
    user_id: user.id,
    project_id: projectId,
  })

  if (error) {
    return { error: error.message }
  }

  // Obtener el vote_count actualizado
  const { data: project } = await supabase
    .from('projects')
    .select('vote_count')
    .eq('id', projectId)
    .single()

  return { success: true, voteCount: project?.vote_count || 0 }
}

/**
 * Elimina el voto de un usuario por un proyecto.
 * Retorna { success, voteCount } o { error }.
 */
export async function unvoteProject(
  projectId: string
): Promise<{ success?: boolean; voteCount?: number; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesión' }
  }

  const { error } = await supabase
    .from('project_votes')
    .delete()
    .eq('user_id', user.id)
    .eq('project_id', projectId)

  if (error) {
    return { error: error.message }
  }

  // Obtener el vote_count actualizado
  const { data: project } = await supabase
    .from('projects')
    .select('vote_count')
    .eq('id', projectId)
    .single()

  return { success: true, voteCount: project?.vote_count || 0 }
}

/**
 * Verifica si el usuario actual ya votó por un proyecto.
 */
export async function hasUserVoted(
  projectId: string
): Promise<{ voted: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { voted: false }
  }

  const { data } = await supabase
    .from('project_votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .single()

  return { voted: !!data }
}
