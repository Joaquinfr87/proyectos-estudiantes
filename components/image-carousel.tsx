'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
  aspectRatio?: 'video' | 'square'
}

export default function ImageCarousel({
  images,
  alt,
  className,
  aspectRatio = 'video',
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) return null

  const prev = () => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <div className={cn('relative group', className)}>
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

        {/* Nav arrows - only if more than 1 image */}
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
          <div className='absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white'>
            {current + 1} / {images.length}
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
