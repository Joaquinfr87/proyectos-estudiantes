'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Upload, X } from 'lucide-react'
import { uploadAvatar } from '@/lib/supabase/storage'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl: string | null
  onUploadComplete: (url: string) => void
  name: string
}

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
  onUploadComplete,
  name,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen debe ser menor a 2MB')
      return
    }

    setError(null)
    setUploading(true)

    // Show local preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Upload to Supabase
    const publicUrl = await uploadAvatar(userId, file)

    if (publicUrl) {
      onUploadComplete(publicUrl)
    } else {
      setError('Error al subir la imagen')
      setPreview(null)
    }

    setUploading(false)
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // Notify parent that avatar was removed
    onUploadComplete('')
  }

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    : 'U'

  return (
    <div className='flex flex-col items-center gap-3'>
      <div className='relative group'>
        <Avatar className='h-24 w-24 border-4 border-zinc-100 shadow-md dark:border-zinc-800'>
          <AvatarImage
            src={preview || currentAvatarUrl || ''}
            alt='Avatar'
          />
          <AvatarFallback className='bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white'>
            {initials}
          </AvatarFallback>
        </Avatar>

        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className='absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'
        >
          <Camera className='h-6 w-6 text-white' />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileSelect}
      />

      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className='h-8 gap-1.5 text-xs'
        >
          <Upload className='h-3.5 w-3.5' />
          {uploading ? 'Subiendo...' : 'Cambiar foto'}
        </Button>

        {(preview || currentAvatarUrl) && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleRemove}
            className='h-8 gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50'
          >
            <X className='h-3.5 w-3.5' />
            Quitar
          </Button>
        )}
      </div>

      {error && (
        <p className='text-xs text-red-500 dark:text-red-400'>{error}</p>
      )}
    </div>
  )
}
