'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  BookOpen,
  Users,
  Code2,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Loader2,
  GitFork,
  ExternalLink,
} from 'lucide-react'
import { getSubjectById, enrollInSubject, unenrollFromSubject, isEnrolled } from '@/lib/actions/subjects'
import type { Subject } from '@/lib/actions/subjects'
import type { Project, Profile } from '@/lib/types'

interface StudentWithProfile {
  student_id: string
  profiles: Pick<Profile, 'full_name' | 'avatar_url' | 'github_username'> | null
}

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [students, setStudents] = useState<StudentWithProfile[]>([])
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

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
          .order('created_at', { ascending: false })

        setProjects((projectsData as Project[]) || [])

        // Fetch enrolled students
        const { data: enrollments } = await supabase
          .from('student_subjects')
          .select('student_id')
          .eq('subject_id', id)

        if (enrollments && enrollments.length > 0) {
          const studentIds = enrollments.map((e) => e.student_id)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, github_username')
            .in('id', studentIds)

          const studentsWithProfiles = enrollments.map((e) => ({
            student_id: e.student_id,
            profiles: profiles?.find((p) => p.id === e.student_id) || null,
          }))

          setStudents(studentsWithProfiles)
        }

        // Check enrollment
        if (authUser) {
          const isUserEnrolled = await isEnrolled(id)
          setEnrolled(isUserEnrolled)
        }
      }

      setLoading(false)
    }
    load()
  }, [params])

  const handleEnroll = async () => {
    if (!subject) return
    setEnrolling(true)
    const result = await enrollInSubject(subject.id)
    if (!result.error) {
      setEnrolled(true)
      setSubject((prev) =>
        prev ? { ...prev, student_count: (prev.student_count || 0) + 1 } : prev
      )
    }
    setEnrolling(false)
  }

  const handleUnenroll = async () => {
    if (!subject) return
    setEnrolling(true)
    const result = await unenrollFromSubject(subject.id)
    if (!result.error) {
      setEnrolled(false)
      setSubject((prev) =>
        prev ? { ...prev, student_count: Math.max((prev.student_count || 1) - 1, 0) } : prev
      )
    }
    setEnrolling(false)
  }

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

            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400'>
                <span className='flex items-center gap-1'>
                  <Users className='h-4 w-4' />
                  {subject.student_count || 0}
                </span>
                <span className='flex items-center gap-1'>
                  <Code2 className='h-4 w-4' />
                  {subject.project_count || 0}
                </span>
              </div>

              {user && (
                enrolled ? (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleUnenroll}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <Loader2 className='mr-1 h-3.5 w-3.5 animate-spin' />
                    ) : (
                      <UserMinus className='mr-1 h-3.5 w-3.5' />
                    )}
                    Desinscribirse
                  </Button>
                ) : (
                  <Button size='sm' onClick={handleEnroll} disabled={enrolling}>
                    {enrolling ? (
                      <Loader2 className='mr-1 h-3.5 w-3.5 animate-spin' />
                    ) : (
                      <UserPlus className='mr-1 h-3.5 w-3.5' />
                    )}
                    Inscribirse
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='grid gap-8 lg:grid-cols-3'>
        {/* Projects */}
        <div className='lg:col-span-2'>
          <h2 className='mb-4 text-lg font-semibold'>
            Proyectos ({projects.length})
          </h2>
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
                            <div className='mt-2 flex items-center gap-2'>
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
                Aún no hay proyectos en esta materia.
              </p>
              {enrolled && (
                <Button className='mt-4' size='sm' render={<Link href='/projects/new' />}>
                  Publicar Proyecto
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Students sidebar */}
        <div>
          <h2 className='mb-4 text-lg font-semibold'>
            Estudiantes ({students.length})
          </h2>
          {students.length > 0 ? (
            <div className='space-y-2'>
              {students.map((student) => {
                const initials = student.profiles?.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'U'

                return (
                  <Link
                    key={student.student_id}
                    href={`/profile/${student.student_id}`}
                    className='flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  >
                    <Avatar className='h-9 w-9'>
                      <AvatarImage
                        src={student.profiles?.avatar_url || ''}
                        alt={student.profiles?.full_name || ''}
                      />
                      <AvatarFallback className='bg-violet-100 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium text-zinc-900 dark:text-zinc-50'>
                        {student.profiles?.full_name || 'Sin nombre'}
                      </p>
                      {student.profiles?.github_username && (
                        <p className='truncate text-xs text-zinc-400'>
                          @{student.profiles.github_username}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className='text-sm text-zinc-400'>
              No hay estudiantes inscritos aún.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
