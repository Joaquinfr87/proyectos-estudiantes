-- ============================================================
-- Migración: Crear tabla de inscripciones a materias
-- ============================================================

CREATE TABLE IF NOT EXISTS public.student_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(student_id, subject_id)
);

-- Habilitar RLS
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;

-- Permisos
GRANT SELECT ON public.student_subjects TO anon;
GRANT SELECT, INSERT, DELETE ON public.student_subjects TO authenticated;

-- Políticas
CREATE POLICY "Las inscripciones son visibles para todos"
  ON public.student_subjects FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden inscribirse a materias"
  ON public.student_subjects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Usuarios pueden desinscribirse de materias"
  ON public.student_subjects FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_student_subjects_student ON public.student_subjects(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_subject ON public.student_subjects(subject_id);

-- ============================================================
-- Agregar subject_id a projects
-- ============================================================

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_subject ON public.projects(subject_id);
