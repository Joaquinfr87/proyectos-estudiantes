'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Suscribe a cambios en tiempo real de un proyecto (vistas y votos).
 * Retorna el conteo actualizado de vistas y votos.
 */
export function useRealtimeProject(
  projectId: string,
  initialViews: number,
  initialVoteCount: number
) {
  const [views, setViews] = useState(initialViews)
  const [voteCount, setVoteCount] = useState(initialVoteCount)

  useEffect(() => {
    setViews(initialViews)
    setVoteCount(initialVoteCount)
  }, [initialViews, initialVoteCount])

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          const newProject = payload.new as { views: number; vote_count: number }
          setViews(newProject.views)
          setVoteCount(newProject.vote_count)
        }
      )
      .subscribe()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [projectId])

  return { views, voteCount }
}
