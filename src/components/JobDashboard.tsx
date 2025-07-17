
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, DollarSign, Clock, Search, Filter, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  remote_allowed: boolean;
  job_type: string;
  salary_min: number;
  salary_max: number;
  experience_level: string;
  status: string;
  created_at: string;
  companies: {
    company_name: string;
    industry: string;
    company_size: string;
  };
}

const JobDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            company_name,
            industry,
            company_size
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companies?.company_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJobType = selectedJobType === 'all' || job.job_type === selectedJobType;
    const matchesExperience = selectedExperienceLevel === 'all' || job.experience_level === selectedExperienceLevel;

    return matchesSearch && matchesJobType && matchesExperience;
  });

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Salary not specified';
    if (!max) return `$${min.toLocaleString()}+`;
    if (!min) return `Up to $${max.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'lead': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'full_time': return 'bg-blue-100 text-blue-800';
      case 'part_time': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-orange-100 text-orange-800';
      case 'freelance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="gradient-card animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>Job Opportunities</span>
          </CardTitle>
          <CardDescription>Loading available positions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Briefcase className="h-5 w-5" />
          <span>Job Opportunities</span>
        </CardTitle>
        <CardDescription>
          Discover and apply to positions that match your skills
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-40">
            <Select value={selectedJobType} onValueChange={setSelectedJobType}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-40">
            <Select value={selectedExperienceLevel} onValueChange={setSelectedExperienceLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="entry">Entry</SelectItem>
                <SelectItem value="mid">Mid-level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              No jobs found matching your criteria.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                      {job.title}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                      {job.companies?.company_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                        {job.remote_allowed && (
                          <Badge variant="secondary" className="ml-1">Remote OK</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getJobTypeBadgeColor(job.job_type)}
                      >
                        {job.job_type.replace('_', '-')}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={getExperienceBadgeColor(job.experience_level)}
                      >
                        {job.experience_level}
                      </Badge>
                    </div>
                    <Button size="sm" className="bg-gradient-primary text-white">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Apply Now
                    </Button>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 mb-4 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-slate-600 dark:text-slate-400">
                    {job.companies?.industry} • {job.companies?.company_size} employees
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobDashboard;
