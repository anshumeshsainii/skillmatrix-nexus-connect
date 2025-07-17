
import React from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navigation />
        <main>
          <Dashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
