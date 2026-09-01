-- ============================================================
-- Migración: Crear tabla project_votes
-- Fecha: 2024-01-01
-- Descripción: Tabla de votos para proyectos con trigger automático
-- ============================================================

-- Crear tabla project_votes
CREATE TABLE IF NOT EXISTS public.project_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, project_id)
);

-- Habilitar RLS
ALTER TABLE public.project_votes ENABLE ROW LEVEL SECURITY;

-- Permisos para Data API
GRANT SELECT ON public.project_votes TO anon;
GRANT SELECT, INSERT, DELETE ON public.project_votes TO authenticated;

-- Políticas RLS
CREATE POLICY "Los votos son visibles para todos"
  ON public.project_votes FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden votar"
  ON public.project_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar su propio voto"
  ON public.project_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_project_votes_user_id 
  ON public.project_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_project_votes_project_id 
  ON public.project_votes(project_id);

-- Función para actualizar vote_count en projects
CREATE OR REPLACE FUNCTION public.update_project_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects SET vote_count = vote_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects SET vote_count = vote_count - 1 WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Trigger para mantener vote_count sincronizado
DROP TRIGGER IF EXISTS on_vote_change ON public.project_votes;
CREATE TRIGGER on_vote_change
  AFTER INSERT OR DELETE ON public.project_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_project_vote_count();
