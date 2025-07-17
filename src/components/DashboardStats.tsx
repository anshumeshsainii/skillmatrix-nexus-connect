
import React from 'react';
import { Users, Briefcase, MessageSquare, TrendingUp, LucideIcon } from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
}

const DashboardStats = () => {
  const stats: StatCard[] = [
    {
      title: 'Active Candidates',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: Users
    },
    {
      title: 'Open Positions',
      value: '89',
      change: '+5%',
      changeType: 'positive',
      icon: Briefcase
    },
    {
      title: 'Interviews Scheduled',
      value: '156',
      change: '+23%',
      changeType: 'positive',
      icon: MessageSquare
    },
    {
      title: 'Placement Rate',
      value: '94%',
      change: '+2%',
      changeType: 'positive',
      icon: TrendingUp
    }
  ];

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.title} 
            className="gradient-card p-6 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <Icon size={24} className="text-white" />
              </div>
              <span className={`text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                {stat.change}
              </span>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                {stat.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
