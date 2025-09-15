-- Enable realtime for maintenance_requests table
ALTER TABLE public.maintenance_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_requests;

-- Add additional columns for civic reporting
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS category character varying DEFAULT 'infrastructure',
ADD COLUMN IF NOT EXISTS department character varying,
ADD COLUMN IF NOT EXISTS reporter_phone character varying,
ADD COLUMN IF NOT EXISTS estimated_resolution_time integer,
ADD COLUMN IF NOT EXISTS actual_resolution_time integer,
ADD COLUMN IF NOT EXISTS citizen_rating integer CHECK (citizen_rating >= 1 AND citizen_rating <= 5),
ADD COLUMN IF NOT EXISTS resolution_notes text,
ADD COLUMN IF NOT EXISTS audio_description_url text,
ADD COLUMN IF NOT EXISTS ai_analysis_data jsonb;

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  push_notifications boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on notification preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for notification preferences
CREATE POLICY "Users can manage their notification preferences" 
ON public.notification_preferences 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create departments table for routing
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying NOT NULL UNIQUE,
  description text,
  contact_email character varying,
  contact_phone character varying,
  response_time_hours integer DEFAULT 24,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default departments
INSERT INTO public.departments (name, description, response_time_hours) VALUES
('Public Works', 'Road maintenance, infrastructure, utilities', 48),
('Sanitation', 'Waste management, cleaning services', 24),
('Parks & Recreation', 'Parks, playgrounds, recreational facilities', 72),
('Transportation', 'Traffic signals, signage, public transport', 24),
('Environmental', 'Environmental issues, pollution, hazardous materials', 12),
('Emergency Services', 'Urgent safety issues requiring immediate attention', 2)
ON CONFLICT (name) DO NOTHING;

-- Create analytics table for reporting trends
CREATE TABLE IF NOT EXISTS public.analytics_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  total_reports integer DEFAULT 0,
  resolved_reports integer DEFAULT 0,
  average_resolution_time numeric DEFAULT 0,
  department character varying,
  location_zone character varying,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on departments (read-only for all authenticated users)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Departments are viewable by authenticated users" 
ON public.departments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for notification preferences
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();