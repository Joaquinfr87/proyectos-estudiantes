-- ============================================================
-- Migración: Agregar columnas views y vote_count
-- Fecha: 2024-01-01
-- Descripción: Agregar contador de vistas y votos a projects
-- ============================================================

-- Agregar columna views
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0 NOT NULL;

-- Agregar columna vote_count
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0 NOT NULL;

-- Índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_projects_views 
  ON public.projects(views DESC);
CREATE INDEX IF NOT EXISTS idx_projects_vote_count 
  ON public.projects(vote_count DESC);
