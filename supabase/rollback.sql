-- ROLLBACK: Elimina todo lo creado por schema.sql
-- Ejecutar en orden inverso al de creación

-- 1. ELIMINAR POLÍTICAS DE STORAGE (buckets: avatars, project-images)
DROP POLICY IF EXISTS "Avatars son visibles para todos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus avatars" ON storage.objects;

DROP POLICY IF EXISTS "Imágenes de proyectos son visibles para todos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir imágenes de proyectos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar imágenes de sus proyectos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar imágenes de sus proyectos" ON storage.objects;

-- 2. ELIMINAR POLÍTICAS RLS DE PROJECTS
DROP POLICY IF EXISTS "Los proyectos son visibles para todos" ON public.projects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear proyectos" ON public.projects;
DROP POLICY IF EXISTS "Los autores pueden actualizar sus proyectos" ON public.projects;
DROP POLICY IF EXISTS "Los autores pueden eliminar sus proyectos" ON public.projects;

-- 3. ELIMINAR POLÍTICAS RLS DE PROFILES
DROP POLICY IF EXISTS "Los perfiles son visibles para todos" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;

-- 4. ELIMINAR TRIGGER Y FUNCIÓN
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 5. ELIMINAR TABLAS (orden inverso por las foreign keys)
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.profiles;

-- 6. (OPCIONAL) VACIAR ARCHIVOS DE STORAGE
-- Descomenta estas líneas si también quieres borrar los archivos subidos
-- DELETE FROM storage.objects WHERE bucket_id = 'avatars';
-- DELETE FROM storage.objects WHERE bucket_id = 'project-images';

-- 7. (OPCIONAL) ELIMINAR BUCKETS
-- Descomenta si quieres borrar los buckets también
-- DELETE FROM storage.buckets WHERE id = 'avatars';
-- DELETE FROM storage.buckets WHERE id = 'project-images';
