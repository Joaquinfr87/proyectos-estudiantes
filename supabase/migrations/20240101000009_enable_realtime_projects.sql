-- ============================================================
-- Migración: Habilitar Realtime en la tabla projects
-- ============================================================

-- Habilitar REPLICA IDENTITY FULL para capturar cambios completos
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;

-- Agregar tablas al publicación de Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
