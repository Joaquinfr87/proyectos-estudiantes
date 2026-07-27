'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProjectPaginationProps {
  currentPage: number
  totalPages: number
  total: number
}

export default function ProjectPagination({
  currentPage,
  totalPages,
  total,
}: ProjectPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (page <= 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }
      return params.toString()
    },
    [searchParams]
  )

  const goToPage = (page: number) => {
    router.push(`${pathname}?${createQueryString(page)}`)
  }

  if (totalPages <= 1) return null

  // Generate page numbers to display
  const pages: (number | 'ellipsis')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  return (
    <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-between'>
      <p className='text-sm text-zinc-500 dark:text-zinc-400'>
        Mostrando página{' '}
        <span className='font-medium text-zinc-900 dark:text-zinc-50'>
          {currentPage}
        </span>{' '}
        de{' '}
        <span className='font-medium text-zinc-900 dark:text-zinc-50'>
          {totalPages}
        </span>{' '}
        ·{' '}
        <span className='font-medium text-zinc-900 dark:text-zinc-50'>
          {total}
        </span>{' '}
        proyecto{total !== 1 ? 's' : ''} en total
      </p>

      <div className='flex items-center gap-1'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className='h-8 w-8 p-0'
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className='flex h-8 w-8 items-center justify-center text-sm text-zinc-400'
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size='sm'
              onClick={() => goToPage(page)}
              className='h-8 w-8 p-0 text-sm'
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant='outline'
          size='sm'
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className='h-8 w-8 p-0'
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
