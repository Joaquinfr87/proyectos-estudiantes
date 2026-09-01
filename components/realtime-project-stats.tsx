'use client'

import { useRealtimeProject } from '@/lib/hooks/use-realtime-project'
import { Eye, Heart } from 'lucide-react'

interface RealtimeProjectStatsProps {
  projectId: string
  initialViews: number
  initialVoteCount: number
}

export default function RealtimeProjectStats({
  projectId,
  initialViews,
  initialVoteCount,
}: RealtimeProjectStatsProps) {
  const { views, voteCount } = useRealtimeProject(
    projectId,
    initialViews,
    initialVoteCount
  )

  return (
    <>
      <span className='flex items-center gap-1.5'>
        <Eye className='h-4 w-4' />
        {views} vistas
      </span>
      <span className='flex items-center gap-1.5'>
        <Heart className='h-4 w-4' />
        {voteCount} votos
      </span>
    </>
  )
}
