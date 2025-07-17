
import React from 'react';
import { Search, Filter, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

interface Candidate {
  id: string;
  name: string;
  title: string;
  avatar: string;
  skills: Skill[];
  matchScore: number;
}

const DynamicSkillMatrix = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);

  // Sample data
  const skills = [
    { id: '1', name: 'React', category: 'Frontend', level: 4 },
    { id: '2', name: 'TypeScript', category: 'Frontend', level: 5 },
    { id: '3', name: 'Node.js', category: 'Backend', level: 4 },
    { id: '4', name: 'Python', category: 'Backend', level: 3 },
    { id: '5', name: 'AWS', category: 'Cloud', level: 4 },
    { id: '6', name: 'Docker', category: 'DevOps', level: 3 },
  ];

  const candidates: Candidate[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Senior Frontend Developer',
      avatar: '👩‍💻',
      skills: [
        { id: '1', name: 'React', category: 'Frontend', level: 5 },
        { id: '2', name: 'TypeScript', category: 'Frontend', level: 4 },
      ],
      matchScore: 95
    },
    {
      id: '2',
      name: 'Mike Johnson',
      title: 'Full Stack Engineer',
      avatar: '👨‍💻',
      skills: [
        { id: '3', name: 'Node.js', category: 'Backend', level: 5 },
        { id: '5', name: 'AWS', category: 'Cloud', level: 4 },
      ],
      matchScore: 88
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      title: 'DevOps Engineer',
      avatar: '👩‍🔧',
      skills: [
        { id: '5', name: 'AWS', category: 'Cloud', level: 5 },
        { id: '6', name: 'Docker', category: 'DevOps', level: 4 },
      ],
      matchScore: 92
    }
  ];

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const getSkillLevel = (candidate: Candidate, skillId: string) => {
    const skill = candidate.skills.find(s => s.id === skillId);
    return skill?.level || 0;
  };

  const renderSkillLevel = (level: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={`${
              star <= level 
                ? 'text-yellow-400 fill-current' 
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Skill Matrix
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Interactive visualization of candidate skills and expertise levels
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Skills Filter */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <button
            key={skill.id}
            onClick={() => toggleSkillSelection(skill.id)}
            className={`skill-badge ${
              selectedSkills.includes(skill.id)
                ? 'bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {skill.name}
          </button>
        ))}
      </div>

      {/* Matrix Grid */}
      <div className="gradient-card p-6 overflow-x-auto">
        <div className="min-w-full">
          <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${skills.length}, 120px)` }}>
            {/* Header Row */}
            <div className="font-semibold text-slate-900 dark:text-white">Candidates</div>
            {skills.map((skill) => (
              <div key={skill.id} className="text-center">
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  {skill.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {skill.category}
                </div>
              </div>
            ))}

            {/* Candidate Rows */}
            {candidates.map((candidate) => (
              <React.Fragment key={candidate.id}>
                <div className="flex items-center space-x-3 py-3">
                  <div className="text-2xl">{candidate.avatar}</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {candidate.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {candidate.title}
                    </div>
                    <div className="text-xs font-medium text-green-600">
                      {candidate.matchScore}% match
                    </div>
                  </div>
                </div>
                
                {skills.map((skill) => {
                  const level = getSkillLevel(candidate, skill.id);
                  return (
                    <div 
                      key={`${candidate.id}-${skill.id}`}
                      className={`matrix-cell ${level > 0 ? 'active' : ''}`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        {level > 0 ? (
                          <>
                            <div className="text-lg font-bold text-blue-600">
                              {level}
                            </div>
                            {renderSkillLevel(level)}
                          </>
                        ) : (
                          <div className="text-slate-300 dark:text-slate-600">—</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicSkillMatrix;
