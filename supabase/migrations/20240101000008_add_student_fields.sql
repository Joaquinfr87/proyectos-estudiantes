-- ============================================================
-- Migración: Agregar campos de estudiante al perfil
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS semester TEXT,
  ADD COLUMN IF NOT EXISTS career TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
