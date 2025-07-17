
import React from 'react';
import DashboardStats from './DashboardStats';
import DynamicSkillMatrix from './DynamicSkillMatrix';
import JobDashboard from './JobDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, Alex! 👋
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Here's what's happening with your talent pipeline today.
        </p>
      </div>

      {/* Stats Overview */}
      <DashboardStats />

      {/* Main Content Tabs */}
      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
          <TabsTrigger value="matrix" className="text-sm">
            Skill Matrix
          </TabsTrigger>
          <TabsTrigger value="jobs" className="text-sm">
            Job Dashboard
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="matrix" className="animate-fade-in">
          <DynamicSkillMatrix />
        </TabsContent>
        
        <TabsContent value="jobs" className="animate-fade-in">
          <JobDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
