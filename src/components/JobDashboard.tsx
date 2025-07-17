
import React from 'react';
import { MapPin, Clock, DollarSign, Users, Search, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salary: string;
  posted: string;
  applicants: number;
  requiredSkills: string[];
  description: string;
  urgency: 'low' | 'medium' | 'high';
}

const JobDashboard = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<string>('posted');

  const jobs: Job[] = [
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $150k',
      posted: '2 days ago',
      applicants: 24,
      requiredSkills: ['React', 'TypeScript', 'Node.js'],
      description: 'We are looking for a senior React developer to join our growing team...',
      urgency: 'high'
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      type: 'Remote',
      salary: '$90k - $120k',
      posted: '1 week ago',
      applicants: 18,
      requiredSkills: ['Python', 'React', 'AWS'],
      description: 'Join our innovative startup as a full stack engineer...',
      urgency: 'medium'
    },
    {
      id: '3',
      title: 'DevOps Engineer',
      company: 'CloudTech Solutions',
      location: 'Austin, TX',
      type: 'Full-time',
      salary: '$100k - $130k',
      posted: '3 days ago',
      applicants: 12,
      requiredSkills: ['AWS', 'Docker', 'Kubernetes'],
      description: 'Looking for an experienced DevOps engineer to manage our infrastructure...',
      urgency: 'high'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || job.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Job Dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Manage and track job postings with advanced filtering
          </p>
        </div>
        
        <Button className="bg-gradient-primary hover:shadow-lg">
          Post New Job
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search jobs, companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Remote">Remote</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="posted">Sort by Date</option>
          <option value="applicants">Sort by Applicants</option>
          <option value="urgency">Sort by Urgency</option>
        </select>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="gradient-card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                      {job.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      {job.company}
                    </p>
                  </div>
                  <Badge className={getUrgencyColor(job.urgency)}>
                    {job.urgency} priority
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {job.posted}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {job.applicants} applicants
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="skill-badge text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                  {job.description}
                </p>
              </div>
              
              <div className="flex flex-row lg:flex-col gap-2">
                <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                  <Eye size={16} className="mr-2" />
                  View Details
                </Button>
                <Button className="bg-gradient-primary flex-1 lg:flex-none">
                  Manage
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg mb-2">No jobs found</div>
          <p className="text-slate-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default JobDashboard;
