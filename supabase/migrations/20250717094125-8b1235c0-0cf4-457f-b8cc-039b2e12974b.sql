
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'company')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table with hierarchical structure
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  parent_id UUID REFERENCES public.skills(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table (extends profiles for candidates)
CREATE TABLE public.candidates (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  experience_years INTEGER DEFAULT 0,
  salary_expectation INTEGER,
  availability_status TEXT DEFAULT 'open' CHECK (availability_status IN ('open', 'interviewing', 'not_available')),
  resume_url TEXT,
  portfolio_url TEXT,
  preferred_job_type TEXT DEFAULT 'full_time' CHECK (preferred_job_type IN ('full_time', 'part_time', 'contract', 'freelance')),
  preferred_location TEXT,
  remote_preference BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidate_skills junction table
CREATE TABLE public.candidate_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
  years_experience INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidate_id, skill_id)
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  description TEXT,
  website TEXT,
  logo_url TEXT,
  founded_year INTEGER,
  headquarters TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  remote_allowed BOOLEAN DEFAULT FALSE,
  job_type TEXT DEFAULT 'full_time' CHECK (job_type IN ('full_time', 'part_time', 'contract', 'freelance')),
  salary_min INTEGER,
  salary_max INTEGER,
  experience_level TEXT DEFAULT 'mid' CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  application_deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_skills junction table
CREATE TABLE public.job_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  required_level INTEGER DEFAULT 1 CHECK (required_level BETWEEN 1 AND 5),
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, skill_id)
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interviewing', 'offered', 'accepted', 'rejected')),
  cover_letter TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resume_data table for resume builder
CREATE TABLE public.resume_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  template_name TEXT DEFAULT 'default',
  content JSONB NOT NULL DEFAULT '{}',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

-- Skills policies (public read access)
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can manage skills" ON public.skills FOR ALL USING (auth.role() = 'authenticated');

-- Candidates policies
CREATE POLICY "Users can view their own candidate profile" ON public.candidates FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own candidate profile" ON public.candidates FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own candidate profile" ON public.candidates FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public candidate profiles are viewable" ON public.candidates FOR SELECT USING (true);

-- Candidate skills policies
CREATE POLICY "Users can manage their own candidate skills" ON public.candidate_skills FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Public candidate skills are viewable" ON public.candidate_skills FOR SELECT USING (true);

-- Companies policies
CREATE POLICY "Company owners can manage their company" ON public.companies FOR ALL USING (profile_id = auth.uid());
CREATE POLICY "Public companies are viewable" ON public.companies FOR SELECT USING (true);

-- Jobs policies
CREATE POLICY "Company owners can manage their jobs" ON public.jobs FOR ALL USING (
  company_id IN (SELECT id FROM public.companies WHERE profile_id = auth.uid())
);
CREATE POLICY "Public jobs are viewable" ON public.jobs FOR SELECT USING (status = 'active');

-- Job skills policies
CREATE POLICY "Company owners can manage job skills" ON public.job_skills FOR ALL USING (
  job_id IN (
    SELECT j.id FROM public.jobs j 
    JOIN public.companies c ON j.company_id = c.id 
    WHERE c.profile_id = auth.uid()
  )
);
CREATE POLICY "Public job skills are viewable" ON public.job_skills FOR SELECT USING (true);

-- Applications policies
CREATE POLICY "Candidates can manage their applications" ON public.applications FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Company owners can view applications for their jobs" ON public.applications FOR SELECT USING (
  job_id IN (
    SELECT j.id FROM public.jobs j 
    JOIN public.companies c ON j.company_id = c.id 
    WHERE c.profile_id = auth.uid()
  )
);
CREATE POLICY "Company owners can update applications for their jobs" ON public.applications FOR UPDATE USING (
  job_id IN (
    SELECT j.id FROM public.jobs j 
    JOIN public.companies c ON j.company_id = c.id 
    WHERE c.profile_id = auth.uid()
  )
);

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their sent messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- Resume data policies
CREATE POLICY "Candidates can manage their resume data" ON public.resume_data FOR ALL USING (auth.uid() = candidate_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample skills
INSERT INTO public.skills (name, category) VALUES
('JavaScript', 'Programming Languages'),
('TypeScript', 'Programming Languages'),
('Python', 'Programming Languages'),
('Java', 'Programming Languages'),
('React', 'Frontend Frameworks'),
('Vue.js', 'Frontend Frameworks'),
('Angular', 'Frontend Frameworks'),
('Node.js', 'Backend Technologies'),
('Express.js', 'Backend Technologies'),
('PostgreSQL', 'Databases'),
('MongoDB', 'Databases'),
('AWS', 'Cloud Platforms'),
('Docker', 'DevOps'),
('Git', 'Version Control'),
('Figma', 'Design Tools'),
('Project Management', 'Soft Skills'),
('Communication', 'Soft Skills'),
('Leadership', 'Soft Skills');

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_candidates_availability ON public.candidates(availability_status);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read_at);
