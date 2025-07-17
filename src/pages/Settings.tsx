
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Navigation from '@/components/Navigation';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your application preferences and notifications.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New job matches</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified when new jobs match your skills
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Application updates</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified about application status changes
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Messages</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified about new messages
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>
                Control your privacy and visibility settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile visibility</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Make your profile visible to recruiters
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show online status</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Let others see when you're online
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline">Change Password</Button>
              <Button variant="outline">Download Data</Button>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
