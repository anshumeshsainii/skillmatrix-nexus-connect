
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Filter } from 'lucide-react';

interface Candidate {
  id: string;
  profiles: {
    full_name: string;
    email: string;
    location: string;
  };
  experience_years: number;
  availability_status: string;
}

interface CandidateSkill {
  skill_id: string;
  proficiency_level: number;
  years_experience: number;
  skills: {
    name: string;
    category: string;
  };
}

const DynamicSkillMatrix = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateSkills, setCandidateSkills] = useState<Record<string, CandidateSkill[]>>({});
  const [skills, setSkills] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch candidates with profiles
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select(`
          id,
          experience_years,
          availability_status,
          profiles (
            full_name,
            email,
            location
          )
        `)
        .eq('availability_status', 'open');

      if (candidatesError) throw candidatesError;

      // Fetch all skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true });

      if (skillsError) throw skillsError;

      // Fetch candidate skills
      const { data: candidateSkillsData, error: candidateSkillsError } = await supabase
        .from('candidate_skills')
        .select(`
          candidate_id,
          skill_id,
          proficiency_level,
          years_experience,
          skills (
            name,
            category
          )
        `);

      if (candidateSkillsError) throw candidateSkillsError;

      // Group candidate skills by candidate ID
      const skillsByCandidate: Record<string, CandidateSkill[]> = {};
      candidateSkillsData?.forEach(skill => {
        if (!skillsByCandidate[skill.candidate_id]) {
          skillsByCandidate[skill.candidate_id] = [];
        }
        skillsByCandidate[skill.candidate_id].push(skill);
      });

      setCandidates(candidatesData || []);
      setSkills(skillsData || []);
      setCandidateSkills(skillsByCandidate);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillCategories = () => {
    const categories = [...new Set(skills.map(skill => skill.category))];
    return ['all', ...categories];
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidateSkills[candidate.id]?.some(skill => 
        skill.skills.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = selectedCategory === 'all' || 
      candidateSkills[candidate.id]?.some(skill => 
        skill.skills.category === selectedCategory
      );

    return matchesSearch && matchesCategory;
  });

  const getProficiencyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-green-100 text-green-800 border-green-200';
      case 5: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProficiencyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Basic';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className="gradient-card animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Dynamic Skill Matrix</span>
          </CardTitle>
          <CardDescription>Loading candidate data...</CardDescription>
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
          <Users className="h-5 w-5" />
          <span>Dynamic Skill Matrix</span>
        </CardTitle>
        <CardDescription>
          Interactive visualization of candidates and their skill proficiencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search candidates or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {getSkillCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="space-y-4">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              No candidates found matching your criteria.
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {candidate.profiles?.full_name || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {candidate.experience_years} years experience • {candidate.profiles?.location}
                    </p>
                  </div>
                  <Badge 
                    variant={candidate.availability_status === 'open' ? 'default' : 'secondary'}
                    className={candidate.availability_status === 'open' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {candidate.availability_status}
                  </Badge>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {candidateSkills[candidate.id]?.map((skill) => (
                    <Badge
                      key={skill.skill_id}
                      variant="outline"
                      className={`${getProficiencyColor(skill.proficiency_level)} border`}
                    >
                      {skill.skills.name} • {getProficiencyLabel(skill.proficiency_level)}
                      {skill.years_experience > 0 && ` (${skill.years_experience}y)`}
                    </Badge>
                  )) || (
                    <span className="text-sm text-slate-500 italic">No skills listed</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            Proficiency Levels:
          </h4>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <Badge
                key={level}
                variant="outline"
                className={`${getProficiencyColor(level)} border text-xs`}
              >
                {getProficiencyLabel(level)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicSkillMatrix;
