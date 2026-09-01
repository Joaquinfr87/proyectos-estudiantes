-- ============================================================
-- Migración: Asegurar acceso público a profiles
-- ============================================================

-- Revocar y re-grantear permisos para asegurar acceso público
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.profiles FROM authenticated;

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.profiles TO authenticated;

-- Asegurar que la política de SELECT esté abierta
DROP POLICY IF EXISTS "Los perfiles son visibles para todos" ON public.profiles;
CREATE POLICY "Los perfiles son visibles para todos"
  ON public.profiles FOR SELECT
  USING (true);

-- Asegurar que projects también sea público
REVOKE SELECT ON public.projects FROM anon;
REVOKE SELECT ON public.projects FROM authenticated;

GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.projects TO authenticated;

DROP POLICY IF EXISTS "Los proyectos son visibles para todos" ON public.projects;
CREATE POLICY "Los proyectos son visibles para todos"
  ON public.projects FOR SELECT
  USING (true);
