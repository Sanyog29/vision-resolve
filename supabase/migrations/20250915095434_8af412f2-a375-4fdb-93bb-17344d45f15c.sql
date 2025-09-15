-- Fix security issues: Add RLS policies for analytics_data table

-- Enable RLS on analytics_data table  
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_data (employees can view all, admin can manage)
CREATE POLICY "Authenticated users can view analytics" 
ON public.analytics_data 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can insert analytics data" 
ON public.analytics_data 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND user_type = 'employee'
  )
);