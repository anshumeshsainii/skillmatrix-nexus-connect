
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobPostingModalProps {
  companyId: string;
  onClose: () => void;
  onJobPosted: () => void;
}

const JobPostingModal = ({ companyId, onClose, onJobPosted }: JobPostingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    employment_type: '',
    salary_min: '',
    salary_max: '',
    skills_required: '',
    experience_level: 'mid',
    remote_allowed: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = formData.skills_required
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const { error } = await supabase
        .from('jobs')
        .insert({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          location: formData.location,
          employment_type: formData.employment_type,
          experience_level: formData.experience_level,
          salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
          salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
          remote_allowed: formData.remote_allowed,
          company_id: companyId,
          is_active: true,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Job Posted Successfully",
        description: "Your job posting is now live and visible to candidates."
      });

      onJobPosted();
    } catch (error: any) {
      toast({
        title: "Error posting job",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <CardTitle>Post New Job</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                name="title"
                placeholder="Job Title (e.g., Senior Software Engineer)"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Textarea
                name="description"
                placeholder="Job Description - Describe the role, responsibilities, and what the candidate will be doing..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>

            <div>
              <Textarea
                name="requirements"
                placeholder="Requirements - List the qualifications, skills, and experience needed..."
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="location"
                placeholder="Location (e.g., New York, NY or Remote)"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
              <Select onValueChange={(value) => handleSelectChange('employment_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select onValueChange={(value) => handleSelectChange('experience_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="lead">Lead/Principal</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remote_allowed"
                  name="remote_allowed"
                  checked={formData.remote_allowed}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label htmlFor="remote_allowed" className="text-sm">
                  Remote work allowed
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="salary_min"
                type="number"
                placeholder="Min Salary (optional)"
                value={formData.salary_min}
                onChange={handleInputChange}
              />
              <Input
                name="salary_max"
                type="number"
                placeholder="Max Salary (optional)"
                value={formData.salary_max}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Input
                name="skills_required"
                placeholder="Required Skills (comma separated, e.g., React, Node.js, TypeScript)"
                value={formData.skills_required}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Posting...' : 'Post Job'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobPostingModal;
