'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Subject {
  id: string
  name: string
  description: string | null
  code: string | null
  created_by: string
  created_at: string
  updated_at: string
  student_count?: number
  project_count?: number
}

// Input validation
function sanitizeString(input: string | null, maxLength: number = 200): string {
  if (!input) return ''
  return input.trim().slice(0, maxLength)
}

/**
 * Crear una nueva materia
 */
export async function createSubject(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  try {
    const name = sanitizeString((formData.get('name') as string) || '', 200)
    const description = sanitizeString((formData.get('description') as string) || '', 500)
    const code = sanitizeString((formData.get('code') as string) || '', 20)

    if (!name || name.length < 3) {
      return { error: 'El nombre debe tener al menos 3 caracteres' }
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        name,
        description: description || null,
        code: code || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ya existe una materia con ese nombre' }
      }
      return { error: error.message }
    }

    // Auto-inscribir al creador
    await supabase.from('student_subjects').insert({
      student_id: user.id,
      subject_id: data.id,
    })

    revalidatePath('/subjects')
    return { success: true, subject: data as Subject }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al crear la materia'
    return { error: message }
  }
}

/**
 * Inscribirse a una materia
 */
export async function enrollInSubject(subjectId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const { error } = await supabase.from('student_subjects').insert({
    student_id: user.id,
    subject_id: subjectId,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya estás inscrito en esta materia' }
    }
    return { error: error.message }
  }

  revalidatePath('/subjects')
  revalidatePath(`/subjects/${subjectId}`)
  return { success: true }
}

/**
 * Desinscribirse de una materia
 */
export async function unenrollFromSubject(subjectId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const { error } = await supabase
    .from('student_subjects')
    .delete()
    .eq('student_id', user.id)
    .eq('subject_id', subjectId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/subjects')
  revalidatePath(`/subjects/${subjectId}`)
  return { success: true }
}

/**
 * Verificar si el usuario está inscrito en una materia
 */
export async function isEnrolled(subjectId: string): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from('student_subjects')
    .select('id')
    .eq('student_id', user.id)
    .eq('subject_id', subjectId)
    .single()

  return !!data
}

/**
 * Obtener todas las materias con conteo de estudiantes y proyectos
 */
export async function getSubjectsWithCounts(): Promise<Subject[]> {
  const supabase = await createClient()

  const { data: subjects, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name', { ascending: true })

  if (error || !subjects) return []

  // Get student counts
  const { data: studentCounts } = await supabase
    .from('student_subjects')
    .select('subject_id')

  // Get project counts
  const { data: projectCounts } = await supabase
    .from('projects')
    .select('subject_id')
    .not('subject_id', 'is', null)

  const studentCountMap = new Map<string, number>()
  const projectCountMap = new Map<string, number>()

  studentCounts?.forEach((ss) => {
    studentCountMap.set(ss.subject_id, (studentCountMap.get(ss.subject_id) || 0) + 1)
  })

  projectCounts?.forEach((p) => {
    if (p.subject_id) {
      projectCountMap.set(p.subject_id, (projectCountMap.get(p.subject_id) || 0) + 1)
    }
  })

  return subjects.map((s) => ({
    ...s,
    student_count: studentCountMap.get(s.id) || 0,
    project_count: projectCountMap.get(s.id) || 0,
  }))
}

/**
 * Obtener una materia por ID
 */
export async function getSubjectById(id: string): Promise<Subject | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null

  // Get counts
  const { count: studentCount } = await supabase
    .from('student_subjects')
    .select('id', { count: 'exact', head: true })
    .eq('subject_id', id)

  const { count: projectCount } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('subject_id', id)

  return {
    ...data,
    student_count: studentCount || 0,
    project_count: projectCount || 0,
  } as Subject
}

/**
 * Obtener materias del usuario actual
 */
export async function getMySubjects(): Promise<Subject[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: enrollments } = await supabase
    .from('student_subjects')
    .select('subject_id')
    .eq('student_id', user.id)

  if (!enrollments || enrollments.length === 0) return []

  const subjectIds = enrollments.map((e) => e.subject_id)

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .in('id', subjectIds)
    .order('name', { ascending: true })

  return (subjects as Subject[]) || []
}
