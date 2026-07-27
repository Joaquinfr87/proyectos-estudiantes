-- Esquema de base de datos para Proyectos UPDS
-- Ejecutar esto en el SQL Editor de Supabase

-- 1. TABLA DE PERFILES (vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
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

-- 2. TABLA DE PROYECTOS
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

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para projects
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

-- 3. FUNCIÓN PARA CREAR PERFIL AUTOMÁTICAMENTE AL REGISTRARSE
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

-- 4. BUCKETS DE STORAGE (ejecutar por separado en Supabase dashboard o SQL)
-- NOTA: Crear buckets manualmente desde Supabase Dashboard > Storage:
-- - 'avatars' (público, para fotos de perfil)
-- - 'project-images' (público, para imágenes de proyectos)

-- Políticas para Storage (ejecutar después de crear los buckets)
-- Bucket: avatars
CREATE POLICY "Avatars son visibles para todos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Usuarios autenticados pueden subir avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Usuarios pueden actualizar sus avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Usuarios pueden eliminar sus avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Bucket: project-images
CREATE POLICY "Imágenes de proyectos son visibles para todos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Usuarios autenticados pueden subir imágenes de proyectos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Usuarios pueden actualizar imágenes de sus proyectos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Usuarios pueden eliminar imágenes de sus proyectos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
