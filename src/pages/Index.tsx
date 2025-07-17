
import React from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      <main>
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
