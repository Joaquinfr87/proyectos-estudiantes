export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  github_username: string | null
  bio: string | null
  semester: string | null
  career: string | null
  skills: string[] | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  github_url: string
  live_url: string | null
  tech_stack: string[]
  image_urls: string[]
  views: number
  vote_count: number
  user_id: string
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'full_name' | 'avatar_url' | 'github_username'>
}

export interface ProjectVote {
  id: string
  user_id: string
  project_id: string
  created_at: string
}

export type ProjectFormData = {
  title: string
  description: string
  github_url: string
  live_url?: string
  tech_stack: string[]
  image_urls: string[]
}
