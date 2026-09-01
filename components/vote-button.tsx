'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { voteProject, unvoteProject, hasUserVoted } from '@/lib/actions/interactions'
import { toast } from 'sonner'

interface VoteButtonProps {
  projectId: string
  initialVoteCount: number
  className?: string
}

export default function VoteButton({
  projectId,
  initialVoteCount,
  className,
}: VoteButtonProps) {
  const [voted, setVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkVote() {
      const { voted: hasVoted } = await hasUserVoted(projectId)
      setVoted(hasVoted)
    }
    checkVote()
  }, [projectId])

  const handleVote = async () => {
    if (loading) return
    setLoading(true)

    // Optimistic update
    const previousVoted = voted
    const previousCount = voteCount

    if (voted) {
      setVoted(false)
      setVoteCount((c) => c - 1)
      const result = await unvoteProject(projectId)
      if (result.error) {
        setVoted(previousVoted)
        setVoteCount(previousCount)
        toast.error(result.error)
      }
    } else {
      setVoted(true)
      setVoteCount((c) => c + 1)
      const result = await voteProject(projectId)
      if (result.error) {
        setVoted(previousVoted)
        setVoteCount(previousCount)
        toast.error(result.error)
      } else if (result.voteCount !== undefined) {
        setVoteCount(result.voteCount)
      }
    }

    setLoading(false)
  }

  return (
    <Button
      variant={voted ? 'default' : 'outline'}
      onClick={handleVote}
      disabled={loading}
      className={className}
    >
      <Heart
        className={`mr-2 h-4 w-4 transition-all ${
          voted ? 'fill-current' : ''
        }`}
      />
      {voted ? 'Votado' : 'Votar'}
      <span className='ml-2 text-sm opacity-80'>({voteCount})</span>
    </Button>
  )
}
