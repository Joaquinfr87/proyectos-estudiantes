'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
  aspectRatio?: 'video' | 'square'
  autoPlay?: boolean
  interval?: number
}

export default function ImageCarousel({
  images,
  alt,
  className,
  aspectRatio = 'video',
  autoPlay = false,
  interval = 4000,
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(
    () => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length]
  )

  const prev = () => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1))

  useEffect(() => {
    if (!autoPlay || images.length <= 1 || paused) return
    const id = setInterval(next, interval)
    return () => clearInterval(id)
  }, [autoPlay, interval, paused, next, images.length])

  if (!images || images.length === 0) return null

  return (
    <div
      className={cn('relative group', className)}
      onMouseEnter={() => autoPlay && setPaused(true)}
      onMouseLeave={() => autoPlay && setPaused(false)}
    >
      {/* Main image */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800',
          aspectRatio === 'video' ? 'aspect-video' : 'aspect-square'
        )}
      >
        <img
          src={images[current]}
          alt={`${alt} - imagen ${current + 1}`}
          className='h-full w-full object-cover transition-opacity duration-300'
        />

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className='absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70'
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
            <button
              onClick={next}
              className='absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70'
            >
              <ChevronRight className='h-5 w-5' />
            </button>
          </>
        )}

        {/* Counter badge */}
        {images.length > 1 && (
          <div className='absolute bottom-3 right-3 flex items-center gap-2'>
            {autoPlay && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPaused(!paused)
                }}
                className='flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80'
              >
                {paused ? (
                  <Play className='h-3 w-3' />
                ) : (
                  <Pause className='h-3 w-3' />
                )}
              </button>
            )}
            <span className='rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white'>
              {current + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className='mt-3 flex justify-center gap-1.5'>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                i === current
                  ? 'w-6 bg-violet-600 dark:bg-violet-400'
                  : 'w-2 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
