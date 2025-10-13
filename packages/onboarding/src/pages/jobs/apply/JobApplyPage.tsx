import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Job } from '@/lib/supabase/types';

type ApplicationStep = 1 | 2 | 3;

interface ApplicationData {
  linkedin_url: string;
  github_url: string;
  phone: string;
  college: string;
  gpa: string;
  degree: string;
  graduation_year: string;
  previous_roles: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
}

export default function ApplyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<ApplicationStep>(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ApplicationData>({
    linkedin_url: '',
    github_url: '',
    phone: '',
    college: '',
    gpa: '',
    degree: '',
    graduation_year: '',
    previous_roles: [{ title: '', company: '', duration: '', description: '' }],
  });

  // --- Fetch Job ---
  const fetchJob = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (!id) {
      setError('Job ID is missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle();
      if (error) throw error;

      if (!data) {
        toast({ title: 'Error', description: 'Job not found', variant: 'destructive' });
        navigate('/jobs');
      } else {
        setJob(data);
      }
    } catch (err) {
      console.error('fetchJob error:', err);
      toast({ title: 'Error', description: 'Unable to load job details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, id, navigate, toast]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // --- Reset form on job change ---
  useEffect(() => {
    setFormData({
      linkedin_url: '',
      github_url: '',
      phone: '',
      college: '',
      gpa: '',
      degree: '',
      graduation_year: '',
      previous_roles: [{ title: '', company: '', duration: '', description: '' }],
    });
    setResumeFile(null);
    setError('');
    setCurrentStep(1);
  }, [id]);

  const progress = useMemo(() => (currentStep / 3) * 100, [currentStep]);

  const updateFormData = (field: keyof ApplicationData, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const updateRole = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newRoles = [...prev.previous_roles];
      newRoles[index] = { ...newRoles[index], [field]: value };
      return { ...prev, previous_roles: newRoles };
    });
  };

  const addRole = () => {
    setFormData((prev) => ({
      ...prev,
      previous_roles: [...prev.previous_roles, { title: '', company: '', duration: '', description: '' }],
    }));
  };

  const removeRole = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      previous_roles: prev.previous_roles.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    setError('');
    if (currentStep === 1 && (!formData.linkedin_url || !formData.github_url || !formData.phone)) {
      setError('Please fill in all required fields');
      return;
    }
    if (currentStep === 2 && (!formData.college || !formData.gpa || !formData.degree)) {
      setError('Please fill in all required fields');
      return;
    }
    setCurrentStep((prev) => (prev + 1) as ApplicationStep);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((prev) => (prev - 1) as ApplicationStep);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('File size must be less than 5MB');
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type))
      return setError('Only PDF and DOCX files are allowed');
    setResumeFile(file);
    setError('');
  };

  // --- Submit Application ---
const handleSubmit = async () => {
  if (!resumeFile) return setError('Please upload your resume');
  if (!id || !user) return setError('Invalid session or job ID.');

  setSubmitting(true);
  setError('');

  try {
    // --- Check if the user already applied ---
    const { data: existingApp, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('profile_id', user.id)
      .eq('job_id', id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingApp) {
      setError('You have already applied for this job.');
      setSubmitting(false);
      return;
    }

    // --- Upload Resume ---
    const fileExt = resumeFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, resumeFile, { upsert: true });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);
    const resumeUrl = urlData?.publicUrl;
    if (!resumeUrl) throw new Error('Could not retrieve resume URL.');

    // --- Insert into applications (profile auto-handled by trigger) ---
    const { error: appError } = await supabase.from('applications').insert({
      job_id: id,
      resume_url: resumeUrl,
      status: 'submitted',
      education: {
        college: formData.college,
        gpa: parseFloat(formData.gpa),
        degree: formData.degree,
        graduation_year: parseInt(formData.graduation_year),
      },
      experience: {
        previous_roles: formData.previous_roles.filter((r) => r.title && r.company),
      },
      full_name: user.user_metadata?.full_name || user.email,
      phone: formData.phone,
      linkedin_url: formData.linkedin_url,
      github_url: formData.github_url,
    });

    if (appError) throw appError;

    toast({ title: 'Success!', description: 'Your application has been submitted successfully.' });
    navigate('/dashboard');
  } catch (err: any) {
    console.error('handleSubmit error:', err);
    setError(err.message || 'Unexpected error occurred.');
  } finally {
    setSubmitting(false);
  }
};


  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen text-slate-600">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-3">Loading page...</p>
          </div>
        </div>
      </div>
    );
  }

  // ... (your existing JSX form logic stays the same)


  // --- Main UI ---
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Apply for {job?.title}</CardTitle>
            <CardDescription>
              {job?.department} • {job?.location}
            </CardDescription>
            <div className="mt-4">
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-slate-600 mt-2">Step {currentStep} of 3</p>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {currentStep === 1 && <StepOne formData={formData} updateFormData={updateFormData} nextStep={nextStep} />}
            {currentStep === 2 && (
              <StepTwo
                formData={formData}
                updateFormData={updateFormData}
                updateRole={updateRole}
                addRole={addRole}
                removeRole={removeRole}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {currentStep === 3 && (
              <StepThree
                resumeFile={resumeFile}
                handleFileChange={handleFileChange}
                prevStep={prevStep}
                submitting={submitting}
                handleSubmit={handleSubmit}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Step Components ---
function StepOne({ formData, updateFormData, nextStep }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      <div className="space-y-4">
        <div>
          <Label>Phone *</Label>
          <Input value={formData.phone} onChange={(e) => updateFormData('phone', e.target.value)} />
        </div>
        <div>
          <Label>LinkedIn *</Label>
          <Input value={formData.linkedin_url} onChange={(e) => updateFormData('linkedin_url', e.target.value)} />
        </div>
        <div>
          <Label>GitHub *</Label>
          <Input value={formData.github_url} onChange={(e) => updateFormData('github_url', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={nextStep}>Next</Button>
      </div>
    </div>
  );
}

function StepTwo({ formData, updateFormData, updateRole, addRole, removeRole, nextStep, prevStep }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Education & Experience</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input placeholder="College/University *" value={formData.college} onChange={(e) => updateFormData('college', e.target.value)} />
        <Input placeholder="Degree *" value={formData.degree} onChange={(e) => updateFormData('degree', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input placeholder="GPA *" value={formData.gpa} onChange={(e) => updateFormData('gpa', e.target.value)} />
        <Input placeholder="Graduation Year" value={formData.graduation_year} onChange={(e) => updateFormData('graduation_year', e.target.value)} />
      </div>
      {formData.previous_roles.map((role: any, i: number) => (
        <Card key={i} className="mt-4">
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Job Title" value={role.title} onChange={(e) => updateRole(i, 'title', e.target.value)} />
            <Input placeholder="Company" value={role.company} onChange={(e) => updateRole(i, 'company', e.target.value)} />
            <Input placeholder="Duration" value={role.duration} onChange={(e) => updateRole(i, 'duration', e.target.value)} />
            <Textarea placeholder="Description" value={role.description} onChange={(e) => updateRole(i, 'description', e.target.value)} />
            {formData.previous_roles.length > 1 && <Button variant="outline" size="sm" onClick={() => removeRole(i)}>Remove</Button>}
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={addRole} className="mt-4">Add Another Role</Button>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button onClick={nextStep}>Next</Button>
      </div>
    </div>
  );
}

function StepThree({ resumeFile, handleFileChange, prevStep, submitting, handleSubmit }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Upload Resume</h3>
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        {resumeFile ? (
          <div className="space-y-2">
            <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
            <p className="text-sm font-medium">{resumeFile.name}</p>
            <p className="text-xs text-slate-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <Button variant="outline" size="sm" onClick={() => handleFileChange({ target: { files: [] } } as any)}>Change File</Button>
          </div>
        ) : (
          <Label htmlFor="resume" className="cursor-pointer">
            <div className="space-y-2">
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500">PDF or DOCX (max. 5MB)</p>
            </div>
            <Input id="resume" type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
          </Label>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={prevStep} disabled={submitting}>Back</Button>
        <Button onClick={handleSubmit} disabled={submitting || !resumeFile}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>
  );
}
