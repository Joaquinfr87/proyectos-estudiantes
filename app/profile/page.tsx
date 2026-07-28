'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, getCurrentProfile } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import AvatarUpload from '@/components/avatar-upload'
import type { Profile } from '@/lib/types'
import { Loader2, Save, GitFork, User } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const profileData = await getCurrentProfile()
      setProfile(profileData)
      setAvatarUrl(profileData?.avatar_url || null)

      setLoading(false)
    }
    load()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    if (avatarUrl) {
      formData.set('avatar_url', avatarUrl)
    }

    const result = await updateProfile(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setSaving(false)
  }

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url)
  }

  if (loading) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-400' />
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-2xl px-4 py-8 sm:px-6'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>Mi Perfil</h1>
        <p className='mt-1 text-zinc-500 dark:text-zinc-400'>
          Administra tu información personal
        </p>
      </div>

      <Card className='border-zinc-200 dark:border-zinc-800'>
        <CardHeader className='text-center'>
          <div className='mb-4 flex justify-center'>
            <AvatarUpload
              userId={profile?.id || ''}
              currentAvatarUrl={avatarUrl}
              onUploadComplete={handleAvatarUpload}
              name={profile?.full_name || ''}
            />
          </div>
          <CardTitle className='text-xl'>
            {profile?.full_name || 'Sin nombre'}
          </CardTitle>
          {profile?.github_username && (
            <CardDescription className='flex items-center justify-center gap-1.5'>
              <GitFork className='h-3.5 w-3.5' />
              @{profile.github_username}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div className='space-y-2'>
              <Label htmlFor='full_name'>
                <User className='mr-1.5 inline-block h-3.5 w-3.5' />
                Nombre Completo
              </Label>
              <Input
                id='full_name'
                name='full_name'
                defaultValue={profile?.full_name || ''}
                required
                className='h-10'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='github_username'>
                <GitFork className='mr-1.5 inline-block h-3.5 w-3.5' />
                Usuario de GitHub
              </Label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400'>
                  @
                </span>
                <Input
                  id='github_username'
                  name='github_username'
                  placeholder='usuario'
                  defaultValue={profile?.github_username || ''}
                  className='h-10 pl-7'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bio'>Biografía</Label>
              <Textarea
                id='bio'
                name='bio'
                placeholder='Cuéntanos sobre ti, tus intereses y tecnologías que te apasionan...'
                defaultValue={profile?.bio || ''}
                rows={4}
                className='resize-none'
              />
            </div>

            {error && (
              <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400'>
                {error}
              </div>
            )}

            {success && (
              <div className='rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-400'>
                Perfil actualizado correctamente
              </div>
            )}

            <Button type='submit' disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  Guardar Cambios
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
