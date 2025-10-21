// pages/HomePage.tsx - FIXED
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Briefcase, Brain, Code2, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user, loading, initialized } = useAuth();

  console.log('🏠 HomePage auth state:', { user: user?.email, loading, initialized });

  // Show loading until auth is ready
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p>Loading HireAI...</p>
          <p className="text-sm text-slate-500 mt-2">Initializing: {initialized ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Brain,
      title: 'AI Resume Screening',
      description: 'Automatically parse and score resumes using Google Gemini AI, matching candidates with job requirements.',
    },
    {
      icon: Code2,
      title: 'GitHub Analysis',
      description: 'Evaluate candidate code quality, project complexity, and technical proficiency through automated repository analysis.',
    },
    {
      icon: Users,
      title: 'AI Technical Interviews',
      description: 'Conduct live coding interviews with AI agents that evaluate problem-solving skills and code execution in real-time.',
    },
    {
      icon: CheckCircle2,
      title: 'Behavioral Assessments',
      description: 'AI-powered HR interviews using the STAR method to assess cultural fit and soft skills.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-slate-900">HireAI</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/jobs">Browse Jobs</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/auth/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Hire Smarter with
              <span className="block text-slate-700 mt-2">AI-Powered Interviews</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Streamline your hiring process from resume screening to final interviews with advanced AI agents powered by Google Cloud Platform.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link to={user ? '/jobs' : '/auth/signup'}>
                  {user ? 'Browse Jobs' : 'Start Your Journey'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={user ? '/dashboard' : '/auth/login'}>
                  {user ? 'Go to Dashboard' : 'Learn More'}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
              <p className="text-lg text-slate-600">
                Our AI-driven platform automates every step of the hiring process
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate-600">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-slate-900 text-white border-0">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to revolutionize your hiring?</h2>
                <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of candidates using AI-powered interviews to land their dream jobs.
                </p>
                <Button size="lg" variant="secondary" asChild>
                  <Link to={user ? '/dashboard' : '/auth/signup'}>
                    {user ? 'Go to Dashboard' : 'Get Started Today'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-slate-600">
          <p>&copy; 2025 HireAI. Powered by Google Cloud Platform.</p>
        </div>
      </footer>
    </div>
  );
}