
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Briefcase, Calendar, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import JobPostingModal from '@/components/JobPostingModal';
import ApplicationsModal from '@/components/ApplicationsModal';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Fetch company info and jobs
  const { data: companyData, isLoading } = useQuery({
    queryKey: ['company-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // First, check if user has a company (as owner)
      const { data: ownedCompany, error: ownedCompanyError } = await supabase
        .from('companies')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      let company = null;
      let isOwner = false;

      if (ownedCompany) {
        company = ownedCompany;
        isOwner = true;
      } else {
        // Check if user is an employee of a company
        const { data: employeeData, error: employeeError } = await supabase
          .from('company_employees')
          .select(`
            *,
            company:companies(*)
          `)
          .eq('profile_id', user.id)
          .maybeSingle();

        if (employeeError && employeeError.code !== 'PGRST116') {
          throw employeeError;
        }

        if (employeeData?.company) {
          company = employeeData.company;
          isOwner = false;
        }
      }

      if (!company) {
        return null;
      }

      // Get company jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          applications(
            id,
            status,
            candidate:profiles(full_name, email)
          )
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      return {
        company,
        jobs: jobs || [],
        isOwner
      };
    },
    enabled: !!user?.id
  });

  const handleJobPosted = () => {
    setShowJobModal(false);
    toast({
      title: "Job Posted Successfully",
      description: "Your job posting is now live and visible to candidates."
    });
  };

  const viewApplications = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowApplicationsModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need to be associated with a company to access this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {companyData.company.company_name}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Company Dashboard {!companyData.isOwner && '(Employee)'}
              </p>
            </div>
            {companyData.isOwner && (
              <Button 
                onClick={() => setShowJobModal(true)}
                className="bg-gradient-primary text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Active Jobs
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {companyData.jobs.filter((job: any) => job.is_active !== false).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {companyData.jobs.reduce((total: number, job: any) => total + (job.applications?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    New This Week
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {companyData.jobs.filter((job: any) => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(job.created_at) > weekAgo;
                    }).reduce((total: number, job: any) => total + (job.applications?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Job Postings</CardTitle>
            <CardDescription>
              {companyData.isOwner ? 'Manage your job postings and view applications' : 'View company job postings'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {companyData.jobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-300">
                  No jobs posted yet. {companyData.isOwner && 'Create your first job posting!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {companyData.jobs.map((job: any) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {job.title}
                          </h3>
                          <Badge variant={job.is_active !== false ? "default" : "secondary"}>
                            {job.is_active !== false ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                          {job.location} • {job.employment_type || job.job_type}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {job.applications?.length || 0} applications
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewApplications(job.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showJobModal && companyData.isOwner && (
        <JobPostingModal
          companyId={companyData.company.id}
          onClose={() => setShowJobModal(false)}
          onJobPosted={handleJobPosted}
        />
      )}

      {showApplicationsModal && selectedJobId && (
        <ApplicationsModal
          jobId={selectedJobId}
          onClose={() => {
            setShowApplicationsModal(false);
            setSelectedJobId(null);
          }}
        />
      )}
    </div>
  );
};

export default CompanyDashboard;
