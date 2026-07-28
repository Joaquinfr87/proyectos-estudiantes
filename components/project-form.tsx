'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus, Loader2, GitFork, Globe, Image, Upload, ChevronsUpDown, Check, Search } from 'lucide-react'
import { createProject, updateProject } from '@/lib/actions/projects'
import { uploadProjectImage } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import { ALL_TECH_TAGS } from '@/lib/tech-tags'
import type { Project } from '@/lib/types'

interface ProjectFormProps {
  project?: Project
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const [techStack, setTechStack] = useState<string[]>(
    project?.tech_stack || []
  )
  const [techInput, setTechInput] = useState('')
  const [techDropdownOpen, setTechDropdownOpen] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(
    project?.image_urls || []
  )
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addTech = (tech: string) => {
    if (tech && !techStack.includes(tech)) {
      setTechStack([...techStack, tech])
      setTechInput('')
      setTechDropdownOpen(false)
    }
  }

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech))
  }

  const filteredTechTags = ALL_TECH_TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(techInput.toLowerCase()) &&
      !techStack.includes(tag)
  )

  const MAX_IMAGES = 5

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (imageUrls.length >= MAX_IMAGES) {
      setError(`Máximo ${MAX_IMAGES} imágenes permitidas`)
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB')
      return
    }

    setUploadingImage(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Debes iniciar sesión para subir imágenes')
      setUploadingImage(false)
      return
    }

    const tempId = project?.id || 'temp'
    const url = await uploadProjectImage(user.id, tempId, file)

    if (url) {
      setImageUrls([...imageUrls, url])
    } else {
      setError('Error al subir la imagen')
    }

    setUploadingImage(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (url: string) => {
    setImageUrls(imageUrls.filter((u) => u !== url))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('tech_stack', JSON.stringify(techStack))
    formData.set('image_urls', JSON.stringify(imageUrls))

    let result
    if (project) {
      result = await updateProject(project.id, formData)
    } else {
      result = await createProject(formData)
    }

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400'>
          {error}
        </div>
      )}

      <div className='space-y-2'>
        <Label htmlFor='title' className='text-sm font-medium'>
          Título del Proyecto
        </Label>
        <Input
          id='title'
          name='title'
          placeholder='Ej: Mi Portfolio Personal'
          defaultValue={project?.title}
          required
          className='h-10'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description' className='text-sm font-medium'>
          Descripción
        </Label>
        <Textarea
          id='description'
          name='description'
          placeholder='Describe tu proyecto, qué tecnologías usaste, qué problema resuelve...'
          defaultValue={project?.description}
          required
          rows={4}
          className='resize-none'
        />
      </div>

      {/* Image Upload */}
      <div className='space-y-2'>
        <Label className='text-sm font-medium'>
          <Image className='mr-1.5 inline-block h-3.5 w-3.5' />
          Imágenes del Proyecto
        </Label>
        <div className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage || imageUrls.length >= MAX_IMAGES}
            className='h-10'
          >
            {uploadingImage ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className='mr-2 h-4 w-4' />
                Subir Imagen
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleImageUpload}
          />
        </div>

        {imageUrls.length > 0 && (
          <>
            <p className='text-xs font-medium text-zinc-500 dark:text-zinc-400'>
              {imageUrls.length} / {MAX_IMAGES} imágenes
            </p>
            <div className='mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4'>
            {imageUrls.map((url, index) => (
              <div key={url} className='group relative aspect-video overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800'>
                <img
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  className='h-full w-full object-cover'
                />
                <button
                  type='button'
                  onClick={() => removeImage(url)}
                  className='absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100'
                >
                  <X className='h-3 w-3' />
                </button>
              </div>
            ))}
            </div>
          </>
        )}
        <p className='text-xs text-zinc-400'>
          Máximo {MAX_IMAGES} imágenes. Formatos: JPG, PNG, WebP. Máximo 5MB cada una.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='github_url' className='text-sm font-medium'>
            <GitFork className='mr-1.5 inline-block h-3.5 w-3.5' />
            URL de GitHub
          </Label>
          <Input
            id='github_url'
            name='github_url'
            type='url'
            placeholder='https://github.com/usuario/repo'
            defaultValue={project?.github_url}
            required
            className='h-10'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='live_url' className='text-sm font-medium'>
            <Globe className='mr-1.5 inline-block h-3.5 w-3.5' />
            URL Demo (opcional)
          </Label>
          <Input
            id='live_url'
            name='live_url'
            type='url'
            placeholder='https://midemo.vercel.app'
            defaultValue={project?.live_url || ''}
            className='h-10'
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-medium'>
          <Search className='mr-1.5 inline-block h-3.5 w-3.5' />
          Tecnologías
        </Label>
        <div className='relative'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Input
                value={techInput}
                onChange={(e) => {
                  setTechInput(e.target.value)
                  setTechDropdownOpen(true)
                }}
                onFocus={() => setTechDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (filteredTechTags.length > 0) {
                      addTech(filteredTechTags[0])
                    }
                  }
                  if (e.key === 'Escape') {
                    setTechDropdownOpen(false)
                  }
                }}
                placeholder='Buscar tecnologías...'
                className='h-10 pr-10'
              />
              <button
                type='button'
                onClick={() => setTechDropdownOpen(!techDropdownOpen)}
                className='absolute right-1 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800'
              >
                <ChevronsUpDown className='h-4 w-4' />
              </button>
            </div>
          </div>

          {/* Dropdown de tecnologías predefinidas */}
          {techDropdownOpen && (
            <>
              {/* Overlay para cerrar al hacer clic fuera */}
              <div
                className='fixed inset-0 z-10'
                onClick={() => setTechDropdownOpen(false)}
              />
              <div className='absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950'>
                {filteredTechTags.length > 0 ? (
                  filteredTechTags.map((tag) => (
                    <button
                      key={tag}
                      type='button'
                      onClick={() => addTech(tag)}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    >
                      <Plus className='h-3.5 w-3.5 shrink-0 text-zinc-400' />
                      {tag}
                    </button>
                  ))
                ) : (
                  <div className='px-3 py-4 text-center text-sm text-zinc-400'>
                    {techInput.trim()
                      ? `No se encontró "${techInput}"`
                      : 'Escribe para buscar tecnologías'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Tags seleccionados */}
        {techStack.length > 0 && (
          <div className='flex flex-wrap gap-1.5 pt-1'>
            {techStack.map((tech) => (
              <span
                key={tech}
                className='inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
              >
                {tech}
                <button
                  type='button'
                  onClick={() => removeTech(tech)}
                  className='ml-0.5 rounded-full p-0.5 hover:bg-violet-200 dark:hover:bg-violet-800'
                >
                  <X className='h-3 w-3' />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className='text-xs text-zinc-400'>
          Selecciona las tecnologías de la lista predefinida para mantener la consistencia.
        </p>
      </div>

      <div className='flex items-center gap-3 pt-2'>
        <Button
          type='submit'
          disabled={loading}
          className='min-w-[140px]'
        >
          {loading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Guardando...
            </>
          ) : project ? (
            'Actualizar Proyecto'
          ) : (
            'Publicar Proyecto'
          )}
        </Button>
        <Button
          type='button'
          variant='ghost'
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
