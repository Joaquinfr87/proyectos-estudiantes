-- ============================================================
-- Migración: Crear tabla de materias (subjects)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  code TEXT, -- Código de la materia ej: "SIS-401"
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(name)
);

-- Habilitar RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Permisos
GRANT SELECT ON public.subjects TO anon;
GRANT SELECT, INSERT, UPDATE ON public.subjects TO authenticated;

-- Políticas
CREATE POLICY "Las materias son visibles para todos"
  ON public.subjects FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear materias"
  ON public.subjects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "El creador puede actualizar su materia"
  ON public.subjects FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subjects_name ON public.subjects(name);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);
