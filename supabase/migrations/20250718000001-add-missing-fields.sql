
-- Add missing fields to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employment_type TEXT;

-- Add missing fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_level TEXT;

-- Update applications table to reference profiles directly instead of candidates
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_candidate_id_fkey;
ALTER TABLE public.applications ADD CONSTRAINT applications_candidate_id_fkey 
  FOREIGN KEY (candidate_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);
