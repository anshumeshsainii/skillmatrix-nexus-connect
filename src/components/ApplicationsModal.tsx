
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, User, Mail, Calendar, MessageSquare, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ApplicationsModalProps {
  jobId: string;
  onClose: () => void;
}

const ApplicationsModal = ({ jobId, onClose }: ApplicationsModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          candidate:profiles(
            id,
            full_name,
            email,
            skills,
            experience_level
          ),
          job:jobs(
            id,
            title
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    setUpdatingStatus(applicationId);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Application status changed to ${status}`
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const startConversation = async (candidateId: string, applicationId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: candidateId,
          application_id: applicationId,
          content: "Thank you for your application. We'd like to discuss this opportunity with you.",
          message_type: 'text'
        });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: "Conversation started with candidate"
      });
    } catch (error: any) {
      toast({
        title: "Error starting conversation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Job Applications</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {applications?.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300">
                No applications received yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications?.map((application: any) => (
                <div key={application.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {application.candidate.full_name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {application.candidate.email}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Applied {new Date(application.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      application.status === 'pending' ? 'secondary' :
                      application.status === 'reviewed' ? 'default' :
                      application.status === 'interviewed' ? 'default' :
                      application.status === 'rejected' ? 'destructive' :
                      'default'
                    }>
                      {application.status}
                    </Badge>
                  </div>

                  {application.candidate.skills && application.candidate.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {application.candidate.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.cover_letter && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Cover Letter:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                      disabled={updatingStatus === application.id}
                    >
                      Mark Reviewed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicationStatus(application.id, 'interviewed')}
                      disabled={updatingStatus === application.id}
                    >
                      Schedule Interview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startConversation(application.candidate.id, application.id)}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                      disabled={updatingStatus === application.id}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationsModal;
