-- ============================================================
-- Migración: Crear tabla projects
-- Fecha: 2024-01-01
-- Descripción: Tabla de proyectos de los estudiantes
-- ============================================================

-- Crear tabla projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  github_url TEXT NOT NULL,
  live_url TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  image_urls TEXT[] DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Permisos para Data API
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.projects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;

-- Políticas RLS
CREATE POLICY "Los proyectos son visibles para todos"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear proyectos"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los autores pueden actualizar sus proyectos"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los autores pueden eliminar sus proyectos"
  ON public.projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_projects_user_id 
  ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at 
  ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_tech_stack 
  ON public.projects USING GIN(tech_stack);
