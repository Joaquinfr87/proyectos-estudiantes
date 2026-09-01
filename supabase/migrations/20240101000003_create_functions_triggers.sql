-- ============================================================
-- Migración: Funciones y triggers
-- Fecha: 2024-01-01
-- Descripción: Funciones para crear perfil automático y contador de vistas
-- ============================================================

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para incrementar contador de vistas
CREATE OR REPLACE FUNCTION public.increment_project_views(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.projects SET views = views + 1 WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
