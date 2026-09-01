-- ============================================================
-- Migración: Storage buckets y policies
-- Fecha: 2024-01-01
-- Descripción: Crear buckets de storage y políticas de acceso
-- ============================================================

-- Crear bucket avatars (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Crear bucket project-images (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Políticas para bucket: avatars
-- ============================================================

-- Política: Avatars son visibles para todos
CREATE POLICY "Avatars son visibles para todos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Política: Usuarios autenticados pueden subir avatars
CREATE POLICY "Usuarios autenticados pueden subir avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política: Usuarios pueden actualizar sus avatars
CREATE POLICY "Usuarios pueden actualizar sus avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política: Usuarios pueden eliminar sus avatars
CREATE POLICY "Usuarios pueden eliminar sus avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- Políticas para bucket: project-images
-- ============================================================

-- Política: Imágenes de proyectos son visibles para todos
CREATE POLICY "Imágenes de proyectos son visibles para todos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

-- Política: Usuarios autenticados pueden subir imágenes de proyectos
CREATE POLICY "Usuarios autenticados pueden subir imágenes de proyectos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política: Usuarios pueden actualizar imágenes de sus proyectos
CREATE POLICY "Usuarios pueden actualizar imágenes de sus proyectos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política: Usuarios pueden eliminar imágenes de sus proyectos
CREATE POLICY "Usuarios pueden eliminar imágenes de sus proyectos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
