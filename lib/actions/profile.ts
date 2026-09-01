'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Input validation helper
function sanitizeString(input: string | null, maxLength: number = 500): string {
  if (!input) return ''
  return input.trim().slice(0, maxLength)
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  try {
    const fullName = sanitizeString(formData.get('full_name') as string, 200)
    const githubUsername = sanitizeString(formData.get('github_username') as string, 100)
    const bio = sanitizeString(formData.get('bio') as string, 1000)
    const avatarUrl = (formData.get('avatar_url') as string) || ''
    const semester = sanitizeString(formData.get('semester') as string, 50)
    const career = sanitizeString(formData.get('career') as string, 200)
    const skillsRaw = (formData.get('skills') as string) || ''

    // Validate full name
    if (!fullName || fullName.length < 2) {
      return { error: 'El nombre debe tener al menos 2 caracteres' }
    }

    // Validate GitHub username format
    if (githubUsername && !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(githubUsername)) {
      return { error: 'El usuario de GitHub no es válido' }
    }

    // Parse and validate skills
    const skills = skillsRaw
      ? skillsRaw
          .split(',')
          .map((s) => sanitizeString(s, 50))
          .filter((s) => s.length > 0)
          .slice(0, 20) // Max 20 skills
      : []

    // Validate avatar URL if provided
    if (avatarUrl && !avatarUrl.includes('supabase')) {
      return { error: 'URL de avatar no válida' }
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      github_username: githubUsername || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
      semester: semester || null,
      career: career || null,
      skills,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al actualizar el perfil'
    return { error: message }
  }
}

export async function getProfile(userId: string) {
  const supabase = await createClient()

  // Validate UUID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

export async function getCurrentProfile() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}
