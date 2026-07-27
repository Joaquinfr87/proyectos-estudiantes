'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, RefreshCw } from 'lucide-react'

interface ProjectFiltersProps {
  allTechStacks: string[]
  allAuthors: { id: string; full_name: string | null }[]
}

export default function ProjectFilters({
  allTechStacks,
  allAuthors,
}: ProjectFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentQ = searchParams.get('q') || ''
  const currentTech = searchParams.get('tech') || ''
  const currentAuthor = searchParams.get('author') || ''

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      // Reset to page 1 when filters change
      if (!('page' in updates)) {
        params.delete('page')
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get('q') as string
    router.push(`${pathname}?${createQueryString({ q: q || null })}`)
  }

  const handleTechChange = (value: string | null) => {
    router.push(
      `${pathname}?${createQueryString({ tech: value === 'all' || !value ? null : value })}`
    )
  }

  const handleAuthorChange = (value: string | null) => {
    router.push(
      `${pathname}?${createQueryString({ author: value === 'all' || !value ? null : value })}`
    )
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  const hasFilters = currentQ || currentTech || currentAuthor

  return (
    <div className='space-y-4'>
      {/* Search bar */}
      <form onSubmit={handleSearch} className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400' />
        <Input
          name='q'
          defaultValue={currentQ}
          placeholder='Buscar proyectos por nombre o descripción...'
          className='h-11 pl-9 pr-20'
        />
        <div className='absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1'>
          {currentQ && (
            <button
              type='button'
              onClick={() =>
                router.push(
                  `${pathname}?${createQueryString({ q: null })}`
                )
              }
              className='flex h-8 items-center justify-center rounded-md px-2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          )}
          <Button
            type='submit'
            size='sm'
            className='h-8 px-3 text-xs'
          >
            Buscar
          </Button>
        </div>
      </form>

      {/* Filter dropdowns */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='w-full sm:w-48'>
          <Select
            value={currentTech || 'all'}
            onValueChange={handleTechChange}
          >
            <SelectTrigger className='h-9 text-sm'>
              <SelectValue placeholder='Todas las tecnologías' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todas las tecnologías</SelectItem>
              {allTechStacks.map((tech) => (
                <SelectItem key={tech} value={tech}>
                  {tech}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='w-full sm:w-48'>
          <Select
            value={currentAuthor || 'all'}
            onValueChange={handleAuthorChange}
          >
            <SelectTrigger className='h-9 text-sm'>
              <SelectValue placeholder='Todos los autores' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos los autores</SelectItem>
              {allAuthors.map((author) => (
                <SelectItem key={author.id} value={author.full_name || ''}>
                  {author.full_name || 'Anónimo'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            variant='ghost'
            size='sm'
            onClick={clearFilters}
            className='h-9 gap-1.5 text-xs text-zinc-500'
          >
            <RefreshCw className='h-3.5 w-3.5' />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
