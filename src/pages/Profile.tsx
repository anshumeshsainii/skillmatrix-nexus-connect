
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  website: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  role: string;
}

interface Candidate {
  experience_years: number;
  salary_expectation: number | null;
  availability_status: string;
  preferred_job_type: string;
  preferred_location: string | null;
  remote_preference: boolean;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [candidateSkills, setCandidateSkills] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSkills();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch candidate data if role is candidate
      if (profileData?.role === 'candidate') {
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', user?.id)
          .maybeSingle();

        if (candidateData) {
          setCandidate(candidateData);
        }

        // Fetch candidate skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('candidate_skills')
          .select(`
            *,
            skills (name, category)
          `)
          .eq('candidate_id', user?.id);

        if (skillsData) {
          setCandidateSkills(skillsData);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name');

      if (error) throw error;
      setSkills(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching skills",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCandidateProfile = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('candidates')
        .insert({
          id: user?.id,
          experience_years: 0,
          availability_status: 'open',
          preferred_job_type: 'full_time',
          remote_preference: false
        });

      if (error) throw error;

      toast({
        title: "Candidate profile created",
        description: "Your candidate profile has been created successfully."
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error creating candidate profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCandidate = async (updates: Partial<Candidate>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Candidate profile updated",
        description: "Your candidate profile has been updated successfully."
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error updating candidate profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      const skill = skills.find(s => s.name.toLowerCase() === newSkill.toLowerCase());
      if (!skill) {
        toast({
          title: "Skill not found",
          description: "Please select a skill from the available list.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('candidate_skills')
        .insert({
          candidate_id: user?.id,
          skill_id: skill.id,
          proficiency_level: 3,
          years_experience: 1
        });

      if (error) throw error;

      setNewSkill('');
      fetchProfile();
      
      toast({
        title: "Skill added",
        description: "Skill has been added to your profile."
      });
    } catch (error: any) {
      toast({
        title: "Error adding skill",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('candidate_skills')
        .delete()
        .eq('candidate_id', user?.id)
        .eq('skill_id', skillId);

      if (error) throw error;

      fetchProfile();
      
      toast({
        title: "Skill removed",
        description: "Skill has been removed from your profile."
      });
    } catch (error: any) {
      toast({
        title: "Error removing skill",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your account settings and profile information.
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="candidate">Candidate Info</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Update your basic profile information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input value={profile.email} disabled />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={profile.location || ''}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">LinkedIn URL</label>
                    <Input
                      value={profile.linkedin_url || ''}
                      onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">GitHub URL</label>
                    <Input
                      value={profile.github_url || ''}
                      onChange={(e) => setProfile({...profile, github_url: e.target.value})}
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => updateProfile(profile)}
                  disabled={loading}
                  className="bg-gradient-primary text-white"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidate">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Information</CardTitle>
                <CardDescription>
                  Complete your candidate profile to be discovered by recruiters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!candidate ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      You haven't created a candidate profile yet.
                    </p>
                    <Button 
                      onClick={createCandidateProfile}
                      disabled={loading}
                      className="bg-gradient-primary text-white"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Candidate Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Years of Experience</label>
                        <Input
                          type="number"
                          value={candidate.experience_years || 0}
                          onChange={(e) => setCandidate({...candidate, experience_years: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Salary Expectation (USD)</label>
                        <Input
                          type="number"
                          value={candidate.salary_expectation || ''}
                          onChange={(e) => setCandidate({...candidate, salary_expectation: parseInt(e.target.value) || null})}
                          placeholder="75000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Availability Status</label>
                        <Select
                          value={candidate.availability_status}
                          onValueChange={(value) => setCandidate({...candidate, availability_status: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open to opportunities</SelectItem>
                            <SelectItem value="interviewing">Currently interviewing</SelectItem>
                            <SelectItem value="not_available">Not available</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Preferred Job Type</label>
                        <Select
                          value={candidate.preferred_job_type}
                          onValueChange={(value) => setCandidate({...candidate, preferred_job_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_time">Full-time</SelectItem>
                            <SelectItem value="part_time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="freelance">Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Preferred Location</label>
                      <Input
                        value={candidate.preferred_location || ''}
                        onChange={(e) => setCandidate({...candidate, preferred_location: e.target.value})}
                        placeholder="San Francisco, CA"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remote"
                        checked={candidate.remote_preference}
                        onChange={(e) => setCandidate({...candidate, remote_preference: e.target.checked})}
                        className="rounded"
                      />
                      <label htmlFor="remote" className="text-sm font-medium">
                        Open to remote work
                      </label>
                    </div>

                    <Button 
                      onClick={() => updateCandidate(candidate)}
                      disabled={loading}
                      className="bg-gradient-primary text-white"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Add skills to your profile to be discovered by relevant opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Search and add skills..."
                    list="skills-list"
                  />
                  <datalist id="skills-list">
                    {skills.map(skill => (
                      <option key={skill.id} value={skill.name} />
                    ))}
                  </datalist>
                  <Button onClick={addSkill} className="bg-gradient-primary text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {candidateSkills.map((candidateSkill) => (
                    <Badge
                      key={candidateSkill.id}
                      variant="secondary"
                      className="flex items-center space-x-2"
                    >
                      <span>{candidateSkill.skills.name}</span>
                      <button
                        onClick={() => removeSkill(candidateSkill.skill_id)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
