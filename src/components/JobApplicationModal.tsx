
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  onApplicationSubmitted: () => void;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  job,
  onApplicationSubmitted
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Check if candidate profile exists, create if not
      const { data: candidateExists } = await supabase
        .from('candidates')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!candidateExists) {
        const { error: candidateError } = await supabase
          .from('candidates')
          .insert({
            id: user.id,
            experience_years: 0,
            availability_status: 'open'
          });

        if (candidateError) {
          console.error('Error creating candidate profile:', candidateError);
          throw candidateError;
        }
      }

      // Submit application
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          candidate_id: user.id,
          cover_letter: coverLetter,
          status: 'pending'
        });

      if (applicationError) {
        console.error('Error submitting application:', applicationError);
        throw applicationError;
      }

      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the company. You can now message them directly.",
      });

      setCoverLetter('');
      onApplicationSubmitted();
      onClose();

    } catch (error: any) {
      console.error('Error:', error);
      if (error.code === '23505') {
        toast({
          title: "Already Applied",
          description: "You have already applied for this position.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit application. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for {job?.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cover-letter">Cover Letter</Label>
            <Textarea
              id="cover-letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the employer why you're interested in this position..."
              rows={6}
              className="mt-2"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationModal;
