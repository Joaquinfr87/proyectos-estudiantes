import { createClient } from './client'

const AVATARS_BUCKET = 'avatars'
const PROJECT_IMAGES_BUCKET = 'project-images'

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/avatar.${fileExt}`

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(filePath, file, { upsert: true })

  if (error) {
    console.error('Error uploading avatar:', error)
    return null
  }

  const { data: publicUrl } = supabase.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(filePath)

  return publicUrl.publicUrl
}

export async function uploadProjectImage(
  userId: string,
  projectId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/${projectId}/${crypto.randomUUID()}.${fileExt}`

  const { error } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(filePath, file)

  if (error) {
    console.error('Error uploading project image:', error)
    return null
  }

  const { data: publicUrl } = supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .getPublicUrl(filePath)

  return publicUrl.publicUrl
}

export async function deleteProjectImages(
  userId: string,
  projectId: string
): Promise<boolean> {
  const supabase = createClient()

  const { data: files } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .list(`${userId}/${projectId}`)

  if (!files || files.length === 0) return true

  const filesToRemove = files.map(
    (file) => `${userId}/${projectId}/${file.name}`
  )

  const { error } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .remove(filesToRemove)

  return !error
}

export async function deleteAvatar(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: files } = await supabase.storage
    .from(AVATARS_BUCKET)
    .list(userId)

  if (!files || files.length === 0) return true

  const filesToRemove = files.map((file) => `${userId}/${file.name}`)

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .remove(filesToRemove)

  return !error
}
