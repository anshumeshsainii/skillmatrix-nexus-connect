import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Users, Building, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import JobApplicationModal from './JobApplicationModal';
import JobPostingModal from './JobPostingModal';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  remote_allowed: boolean;
  created_at: string;
  company: {
    company_name: string;
    logo_url?: string;
  };
  job_skills: Array<{
    skill: {
      name: string;
      category: string;
    };
    required_level: number;
    is_required: boolean;
  }>;
}

const JobDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [jobPostingModalOpen, setJobPostingModalOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(company_name, logo_url),
          job_skills(
            required_level,
            is_required,
            skill:skills(name, category)
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job: Job) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to apply for jobs",
        variant: "destructive"
      });
      return;
    }
    setSelectedJob(job);
    setApplicationModalOpen(true);
  };

  const handleJobPosted = () => {
    setJobPostingModalOpen(false);
    fetchJobs();
    toast({
      title: "Job Posted Successfully",
      description: "Your job posting is now live and visible to candidates."
    });
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'lead': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Positions</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {jobs.length} jobs available
          </div>
          {user && (
            <Button 
              onClick={() => setJobPostingModalOpen(true)}
              className="bg-gradient-primary text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post a Job
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <p className="text-sm text-gray-600">{job.company.company_name}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </div>
                {job.remote_allowed && (
                  <Badge variant="secondary">Remote OK</Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatSalary(job.salary_min, job.salary_max)}
                </div>
                <Badge className={getExperienceColor(job.experience_level)}>
                  {job.experience_level}
                </Badge>
              </div>

              <p className="text-sm text-gray-700 line-clamp-3">
                {job.description}
              </p>

              {job.job_skills && job.job_skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {job.job_skills.slice(0, 3).map((jobSkill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {jobSkill.skill.name}
                    </Badge>
                  ))}
                  {job.job_skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.job_skills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(job.created_at).toLocaleDateString()}
                </div>
                <Button 
                  onClick={() => handleApplyClick(job)}
                  size="sm"
                  className="bg-gradient-primary text-white hover:opacity-90"
                >
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
            <p className="text-gray-500">Check back later for new opportunities!</p>
          </CardContent>
        </Card>
      )}

      <JobApplicationModal
        isOpen={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
        job={selectedJob}
        onApplicationSubmitted={fetchJobs}
      />

      {jobPostingModalOpen && (
        <JobPostingModal
          onClose={() => setJobPostingModalOpen(false)}
          onJobPosted={handleJobPosted}
        />
      )}
    </div>
  );
};

export default JobDashboard;
