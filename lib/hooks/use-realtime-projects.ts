'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Project } from '@/lib/types'

/**
 * Suscribe a cambios en tiempo real en la tabla de proyectos.
 * Actualiza los proyectos en la lista cuando cambian vistas o votos.
 */
export function useRealtimeProjects(
  initialProjects: Project[],
  onProjectsUpdate: (projects: Project[]) => void
) {
  const projectsRef = useRef(initialProjects)
  const onProjectsUpdateRef = useRef(onProjectsUpdate)

  useEffect(() => {
    projectsRef.current = initialProjects
  }, [initialProjects])

  useEffect(() => {
    onProjectsUpdateRef.current = onProjectsUpdate
  }, [onProjectsUpdate])

  const handleUpdate = useCallback((payload: { new: Record<string, unknown> }) => {
    const newProject = payload.new as { id: string; views: number; vote_count: number }
    const updated = projectsRef.current.map((p) =>
      p.id === newProject.id
        ? { ...p, views: newProject.views, vote_count: newProject.vote_count }
        : p
    )
    onProjectsUpdateRef.current(updated)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    channel = supabase
      .channel('projects-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
        },
        handleUpdate
      )
      .subscribe()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [handleUpdate])
}
