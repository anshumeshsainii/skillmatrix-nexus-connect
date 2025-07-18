
-- Create company_employees table to link profiles to companies
CREATE TABLE IF NOT EXISTS public.company_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, company_id)
);

-- Add missing fields to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'full_time';

-- Add missing fields to profiles table  
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'mid';

-- Update applications table to reference profiles directly instead of candidates table
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_candidate_id_fkey;
ALTER TABLE public.applications ADD CONSTRAINT applications_candidate_id_fkey 
  FOREIGN KEY (candidate_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add RLS policies for company_employees
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company employees can view their own records" 
  ON public.company_employees 
  FOR SELECT 
  USING (profile_id = auth.uid());

CREATE POLICY "Company owners can manage employees" 
  ON public.company_employees 
  FOR ALL 
  USING (company_id IN (
    SELECT id FROM public.companies WHERE profile_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_employees_profile_id ON public.company_employees(profile_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_company_id ON public.company_employees(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);
