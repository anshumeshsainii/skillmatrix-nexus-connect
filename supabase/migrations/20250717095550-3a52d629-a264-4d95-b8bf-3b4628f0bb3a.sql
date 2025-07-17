
-- Add video call functionality to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'video_call_invite', 'video_call_started', 'video_call_ended'));
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS video_call_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS video_call_duration INTEGER;

-- Create video calls table
CREATE TABLE IF NOT EXISTS public.video_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL UNIQUE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on video_calls table
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

-- Video calls policies
CREATE POLICY "Users can view video calls they participate in" ON public.video_calls
  FOR SELECT USING (auth.uid() = host_id OR auth.uid() = guest_id);

CREATE POLICY "Users can create video calls they host" ON public.video_calls
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Participants can update video calls" ON public.video_calls
  FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- Function to create message when application is submitted
CREATE OR REPLACE FUNCTION public.create_application_message()
RETURNS TRIGGER AS $$
DECLARE
  company_profile_id UUID;
  application_record RECORD;
  job_record RECORD;
  candidate_profile RECORD;
BEGIN
  -- Get the application details with job and company info
  SELECT a.*, j.title as job_title, j.company_id, c.profile_id as company_profile_id, c.company_name
  INTO application_record
  FROM applications a
  JOIN jobs j ON a.job_id = j.id
  JOIN companies c ON j.company_id = c.id
  WHERE a.id = NEW.id;

  -- Get candidate profile info
  SELECT p.full_name, p.email
  INTO candidate_profile
  FROM profiles p
  WHERE p.id = NEW.candidate_id;

  -- Create initial message from candidate to company
  INSERT INTO public.messages (
    sender_id,
    receiver_id,
    application_id,
    content,
    message_type
  ) VALUES (
    NEW.candidate_id,
    application_record.company_profile_id,
    NEW.id,
    format('Hello! I have applied for the %s position at %s. %s', 
      application_record.job_title, 
      application_record.company_name,
      COALESCE(NEW.cover_letter, 'I am excited about this opportunity and look forward to hearing from you.')
    ),
    'text'
  );

  -- Create notification for company
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type
  ) VALUES (
    application_record.company_profile_id,
    'New Job Application',
    format('%s applied for %s position', candidate_profile.full_name, application_record.job_title),
    'info'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new applications
DROP TRIGGER IF EXISTS on_application_created ON public.applications;
CREATE TRIGGER on_application_created
  AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.create_application_message();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_application_id ON public.messages(application_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_room_id ON public.video_calls(room_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON public.video_calls(status);
