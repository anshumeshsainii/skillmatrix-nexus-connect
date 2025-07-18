
-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'company_employee', 'admin'));

-- Create company_employees table to link employees to companies
CREATE TABLE IF NOT EXISTS public.company_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['view_applications', 'post_jobs'],
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, company_id)
);

-- Enable RLS on company_employees table
ALTER TABLE public.company_employees ENABLE ROW LEVEL SECURITY;

-- Company employees policies
CREATE POLICY "Company employees can view their own record" ON public.company_employees
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Company admins can manage employees" ON public.company_employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.company_employees ce 
      WHERE ce.profile_id = auth.uid() 
      AND ce.company_id = company_employees.company_id 
      AND ce.is_admin = TRUE
    )
  );

-- Update jobs table to track who posted the job
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS posted_by UUID REFERENCES public.profiles(id);

-- Function to create company employee profile
CREATE OR REPLACE FUNCTION public.create_company_employee_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with company_employee role
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
  );
  
  -- If role is company_employee, create company employee record
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'candidate') = 'company_employee' THEN
    -- This will be handled in the application after company selection
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_employees_profile_id ON public.company_employees(profile_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_company_id ON public.company_employees(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
