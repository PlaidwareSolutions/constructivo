import { Helmet } from 'react-helmet-async';
import { useUser } from '@/hooks/use-user';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManager } from '@/components/admin/UserManager';
import { TestimonialManager } from '@/components/admin/TestimonialManager';
import { ProjectManager } from '@/components/admin/ProjectManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { COMPANY_NAME } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeCache } from '@/hooks/use-realtime-cache';
import { NotificationsPopover } from '@/components/shared/NotificationsPopover';

export default function AdminDashboard() {
  const { user, isLoading, isAdmin } = useUser();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("projects");
  const queryClient = useQueryClient();

  // Enable real-time cache invalidation
  useRealtimeCache();

  // Prefetch data for all tabs when the dashboard mounts
  useEffect(() => {
    const prefetchData = async () => {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ['/api/projects'],
          staleTime: 0,
        }),
        queryClient.prefetchQuery({
          queryKey: ['/api/testimonials'],
          staleTime: 0,
        }),
        queryClient.prefetchQuery({
          queryKey: ['/api/users'],
          staleTime: 0,
        }),
        queryClient.prefetchQuery({
          queryKey: ['/api/notifications'],
          staleTime: 0,
        }),
      ]);
    };

    if (isAdmin) {
      prefetchData();
    }
  }, [isAdmin, queryClient]);

  // Refetch data when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case 'projects':
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        break;
      case 'testimonials':
        queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
        break;
      case 'users':
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    setLocation('/');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - {COMPANY_NAME}</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <NotificationsPopover />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="projects" value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
              </TabsList>

              <TabsContent value="projects" className="mt-6">
                <ProjectManager />
              </TabsContent>

              <TabsContent value="testimonials" className="mt-6">
                <TestimonialManager />
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <UserManager />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}