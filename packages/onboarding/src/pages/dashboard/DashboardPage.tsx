'use client';

import React, { useEffect, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Application, Profile } from '@/lib/supabase/types';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Briefcase,
  Calendar,
  FileText,
  Github,
  Linkedin,
  Mail,
  Phone,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-500',
  resume_screening: 'bg-yellow-500',
  github_analysis: 'bg-orange-500',
  technical_interview: 'bg-purple-500',
  hr_interview: 'bg-pink-500',
  offer: 'bg-green-500',
  rejected: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  resume_screening: 'Resume Screening',
  github_analysis: 'GitHub Analysis',
  technical_interview: 'Technical Interview',
  hr_interview: 'HR Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

export default function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    linkedin_url: '',
    github_url: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`*, job:jobs(*)`)
        .eq('profile_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      if (data) {
        setApplications(data as Application[]);
      }
    } catch (err) {
      console.error('Unexpected error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (): Promise<void> => {
    const { error } = await supabase.from('profiles').update(profileData).eq('id', user!.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    });

    setEditMode(false);
    refreshProfile();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Manage your profile and track your applications</p>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* -------------------- Applications Tab -------------------- */}
          <TabsContent value="applications" className="space-y-6">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No applications yet</h3>
                  <p className="text-slate-600 mb-4">
                    Start your journey by applying to open positions
                  </p>
                  <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {applications.map((app) => (
                  <Card key={app.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{app.job?.title}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {app.job?.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Applied {new Date(app.created_at).toLocaleDateString()}
                            </span>
                          </CardDescription>
                        </div>
                        <Badge className={statusColors[app.status]}>
                          {statusLabels[app.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {app.resume_score > 0 && (
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <p className="text-slate-600 text-xs mb-1">Resume Score</p>
                              <p className="font-semibold text-lg">{app.resume_score}/100</p>
                            </div>
                          )}
                          {app.github_score > 0 && (
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <p className="text-slate-600 text-xs mb-1">GitHub Score</p>
                              <p className="font-semibold text-lg">{app.github_score}/100</p>
                            </div>
                          )}
                          {app.technical_interview_score > 0 && (
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <p className="text-slate-600 text-xs mb-1">Technical Score</p>
                              <p className="font-semibold text-lg">
                                {app.technical_interview_score}/100
                              </p>
                            </div>
                          )}
                          {app.hr_interview_score > 0 && (
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <p className="text-slate-600 text-xs mb-1">HR Score</p>
                              <p className="font-semibold text-lg">{app.hr_interview_score}/100</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {app.resume_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={app.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Resume
                              </a>
                            </Button>
                          )}
                          {app.status === 'technical_interview' && (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/interview/technical/${app.id}`)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Start Technical Interview
                            </Button>
                          )}
                          {app.status === 'hr_interview' && (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/interview/hr/${app.id}`)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Start HR Interview
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* -------------------- Profile Tab -------------------- */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your personal information</CardDescription>
                  </div>
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleProfileUpdate}>Save Changes</Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    {editMode ? (
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, full_name: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm text-slate-900">{profile?.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-sm text-slate-600">{profile?.email}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    {editMode ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm text-slate-900">{profile?.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Label>
                    {editMode ? (
                      <Input
                        id="linkedin"
                        value={profileData.linkedin_url}
                        onChange={(e) =>
                          setProfileData({ ...profileData, linkedin_url: e.target.value })
                        }
                      />
                    ) : profile?.linkedin_url ? (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View Profile <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-sm text-slate-600">Not provided</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="github" className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Label>
                    {editMode ? (
                      <Input
                        id="github"
                        value={profileData.github_url}
                        onChange={(e) =>
                          setProfileData({ ...profileData, github_url: e.target.value })
                        }
                      />
                    ) : profile?.github_url ? (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View Profile <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-sm text-slate-600">Not provided</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
