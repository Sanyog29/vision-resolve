import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Report {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  category: string;
  department?: string;
  user_id: string;
  assigned_employee_id?: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  original_image_url?: string;
  completion_image_url?: string;
  resolution_notes?: string;
  audio_description_url?: string;
  ai_analysis_data?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('maintenance_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchReports(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data || []) as Report[]);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: {
    title: string;
    description?: string;
    category: string;
    location_address?: string;
    location_lat?: number;
    location_lng?: number;
    original_image_url?: string;
    audio_description_url?: string;
    ai_analysis_data?: any;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert([{
          ...reportData,
          status: 'pending',
          priority: reportData.priority || 'medium'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Your report has been submitted successfully."
      });

      return data;
    } catch (error: any) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateReportStatus = async (
    reportId: string, 
    status: 'pending' | 'in-progress' | 'resolved',
    additionalData?: {
      completion_image_url?: string;
      resolution_notes?: string;
      assigned_employee_id?: string;
    }
  ) => {
    try {
      const updateData: any = { 
        status,
        ...additionalData
      };

      if (status === 'resolved') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Report marked as ${status.replace('-', ' ')}`
      });

      return data;
    } catch (error: any) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive"
      });
      throw error;
    }
  };

  const assignReport = async (reportId: string, employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update({ 
          assigned_employee_id: employeeId,
          status: 'in-progress'
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Report assigned",
        description: "Report has been assigned to an employee"
      });

      return data;
    } catch (error: any) {
      console.error('Error assigning report:', error);
      toast({
        title: "Error",
        description: "Failed to assign report",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    reports,
    loading,
    createReport,
    updateReportStatus,
    assignReport,
    fetchReports
  };
}