
import React from 'react';
import { User, Briefcase, Users, MessageSquare, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileMenu from './ProfileMenu';

const Navigation = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="navbar-blur border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SkillMatrix Connect
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  className={`flex items-center space-x-2 ${
                    activeTab === item.id 
                      ? 'bg-gradient-primary text-white shadow-lg' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
