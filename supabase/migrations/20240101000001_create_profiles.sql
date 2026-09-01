-- ============================================================
-- Migración: Crear tabla profiles
-- Fecha: 2024-01-01
-- Descripción: Tabla de perfiles vinculada a auth.users
-- ============================================================

-- Crear tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permisos para Data API
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- Políticas RLS
CREATE POLICY "Los perfiles son visibles para todos"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_github_username 
  ON public.profiles(github_username);
