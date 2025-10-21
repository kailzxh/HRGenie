'use client'
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Filter, 
  Briefcase, 
  Users, 
  Eye, 
  Calendar,
  Star,
  MapPin,
  Clock,
  Download
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Candidate } from '@/types'

// Define a type for our application object for better type safety
interface Application {
  id: string;
  full_name: string;
  email: string;
  status: string; // Fix: Ensure 'status' property exists
  resume_score?: number;
  github_score?: number;
  created_at: string;
  job_id: string;
  [key: string]: any;
}

// Define a type for job openings
interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: 'Active' | 'Inactive';
  applicants: number;
  postedDate: string;
  salary: string;
  description?: string;
  requirements?: object;
}

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'openings' | 'pipeline' | 'interviews'>('openings')
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<any>({ employment_type: 'Full-time' })
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewJob, setViewJob] = useState<JobOpening | Candidate | null>(null)

const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  // --- State for applications/pipeline ---
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [filters, setFilters] = useState<any>({ q: '', minScore: '', maxScore: '', status: '', job_id: '' })
  const [currentUser, setCurrentUser] = useState<any>(null)

  // ----------- pipeline status labels & buckets -----------
  const statusLabels: Record<string, string> = {
    submitted: 'Submitted',
    resume_screening: 'Resume Screening',
    github_analysis: 'GitHub Analysis',
    technical_interview: 'Technical Interview',
    hr_interview: 'HR Interview',
    hr_screening: 'HR Screening',
    profile_analyzed: 'Profile Analyzed',
    offer: 'Offer',
    rejected: 'Rejected',
    technical_screening: 'Technical Screening',
  }

  // Map pipeline columns to status values in DB
  const pipelineBuckets: Record<string, string[]> = {
    Applied: ['submitted', 'profile_analyzed'],
    Screening: ['resume_screening', 'github_analysis', 'technical_screening'],
    Interview: ['technical_interview', 'hr_interview'],
    Hired: ['offer']
  }
  
  // --- Initial Data Fetching for Jobs and Applications ---
  useEffect(() => {
    async function fetchInitialData() {
      setLoadingApps(true);
      try {
        // Fetch user, jobs, and all applications simultaneously
        const [userRes, jobsRes, appsRes] = await Promise.all([
          fetch('/api/auth/user').catch(() => null),
          fetch('/api/recruitment/jobs'),
          fetch('/api/recruitment/applications')
        ]);

        // Set user role
        if (userRes && userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData);
        } else {
          console.warn('Failed to fetch current user; HR actions will be hidden.');
          setCurrentUser({ role: 'employee' });
        }

        // Process applications
        const appsData: Application[] = appsRes.ok ? await appsRes.json() : [];
        setApplications(Array.isArray(appsData) ? appsData : []);
        
        // Process jobs and calculate applicant counts
        const jobsData = jobsRes.ok ? await jobsRes.json() : [];
        if (Array.isArray(jobsData)) {
          const applicantCounts = appsData.reduce((acc, app) => {
            acc[app.job_id] = (acc[app.job_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          setJobOpenings(
            jobsData.map(job => ({
              id: job.id,
              title: job.title,
              department: job.department,
              location: job.location,
              type: job.employment_type,
              status: job.is_active ? 'Active' : 'Inactive',
              applicants: applicantCounts[job.id] || 0,
              postedDate: new Date(job.created_at).toISOString(),
              salary: job.salary_range,
              description: job.description,
              requirements: job.requirements,
            }))
          );
        }

      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoadingApps(false);
      }
    }
    
    fetchInitialData();
  }, []);

  // ---------- fetch applications from backend based on filters ----------
  async function fetchApplications(extraFilters: any = {}) {
    setLoadingApps(true);
    try {
      const q = { ...filters, ...extraFilters };
      const params = new URLSearchParams();
      Object.entries(q).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });
      
      const url = `/api/recruitment/applications?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        console.error('Failed to fetch applications', await res.text());
        setApplications([]);
        return;
      }
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch applications error:', err);
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  }

  // helper: get applications in a pipeline bucket
  function appsInBucket(bucketName: string) {
    const statuses = pipelineBuckets[bucketName] || [];
    if (!applications.length) return [];
    return applications.filter(a => statuses.includes(a.status));
  }

  // selection helpers
  function toggleSelect(id: string) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function selectAllInBucket(bucketName: string) {
    const ids = appsInBucket(bucketName).map(a => a.id);
    setSelected(prev => {
      const next = { ...prev };
      ids.forEach(id => next[id] = true);
      return next;
    });
  }

  function clearSelection() {
    setSelected({});
  }

  // role gating
  const canModify =true;

  // ✅ FIXED: change single application status - using query parameters
 async function changeStatusSingle(id: string, status: string) {
  if (!canModify) { 
    alert('Permission denied'); 
    return; 
  }

  try {
    const res = await fetch(`/api/recruitment/applications/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notify: true }) // ✅ send status in body
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert('Failed to update status: ' + (err.error || res.statusText));
      return;
    }

    // Re-fetch applications to reflect the change
    await fetchApplications();
  } catch (err) {
    console.error('changeStatusSingle error', err);
    alert('Network error changing status');
  }
}


  // ✅ FIXED: bulk change status for selected ids - using query parameters
 async function bulkChangeStatus(status: string) {
  if (!canModify) { 
    alert('Permission denied'); 
    return; 
  }

  const ids = Object.entries(selected).filter(([_, v]) => v).map(([k]) => k);
  if (ids.length === 0) {
    alert('No candidates selected');
    return;
  }
  if (!confirm(`Change status of ${ids.length} candidate(s) to "${statusLabels[status] || status}"?`)) return;

  try {
    const res = await fetch(`/api/recruitment/applications/bulk-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status, notify: true })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert('Bulk update failed: ' + (err.error || res.statusText));
      return;
    }

    clearSelection();
    await fetchApplications();
    alert('Bulk update successful');
  } catch (err) {
    console.error('bulkChangeStatus error', err);
    alert('Network error during bulk update');
  }
}


  // ✅ FIXED: export filtered list
  async function exportFiltered(format: 'xlsx' | 'csv' = 'xlsx') {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    params.append('format', format);

    try {
      const res = await fetch(`/api/recruitment/applications/export?${params.toString()}`);
      if (!res.ok) {
        const text = await res.text();
        alert('Export failed: ' + text);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      a.href = url;
      a.download = `applications_export.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('exportFiltered error', err);
      alert('Export failed due to network error');
    }
  }

  // ---------------- Color Helpers ----------------
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    }
    return colors[status] || colors.Inactive;
  }

  const [requirementsText, setRequirementsText] = useState('{}');

  const handleSaveJob = async () => {
    const { title, department, location, employment_type } = formData;
    if (!title || !department || !location || !employment_type) {
      alert("Please fill in all required fields: Title, Department, Location, Employment Type");
      return;
    }

    let parsedRequirements;
    try {
      parsedRequirements = JSON.parse(requirementsText);
    } catch (err) {
      alert("Requirements must be valid JSON");
      return;
    }

    const payload = {
      ...formData,
      requirements: parsedRequirements,
      is_active: true,
    };

    try {
      const res = await fetch("/api/recruitment/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        const errorMsg = result.errors ? result.errors.map((e: any) => e.msg).join(', ') : (result.error || "Unknown server error");
        alert(`Failed to create job: ${errorMsg}`);
        return;
      }

      const newJob: JobOpening = {
        id: result.id,
        title: result.title,
        department: result.department,
        location: result.location,
        type: result.employment_type,
        status: result.is_active ? "Active" : "Inactive",
        applicants: 0,
        postedDate: new Date(result.created_at).toISOString(),
        salary: result.salary_range || "",
      };
      
      setJobOpenings(prev => [...prev, newJob]);
      setShowForm(false);
      setFormData({ employment_type: "Full-time" });
      setRequirementsText('{}');

    } catch (error) {
      console.error("Network or server error:", error);
      alert("Something went wrong while saving the job.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruitment</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage job openings, candidates, and hiring pipeline</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Opening</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Open Positions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Positions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobOpenings.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Total Applicants */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applicants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{loadingApps ? '...' : applications.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'openings', label: 'Job Openings', icon: Briefcase },
            { id: 'pipeline', label: 'Candidate Pipeline', icon: Users },
            // { id: 'interviews', label: 'Interviews', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Job Openings */}
        {activeTab === 'openings' && (
          <div className="grid grid-cols-1 gap-6">
            {jobOpenings.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1"><Users className="w-4 h-4" /><span>{job.department}</span></div>
                      <div className="flex items-center space-x-1"><MapPin className="w-4 h-4" /><span>{job.location}</span></div>
                      <div className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{job.type}</span></div>
                      <div className="flex items-center space-x-1"><span className="font-medium">{job.applicants} applicants</span></div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Salary: {job.salary || 'N/A'} • Posted: {new Date(job.postedDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => { setViewJob(job); setShowViewDialog(true) }}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { 
                        setActiveTab('pipeline');
                        const newFilters = { ...filters, job_id: job.id, status: '' };
                        setFilters(newFilters);
                        fetchApplications(newFilters);
                      }}
                      className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      View Applications
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Candidate Pipeline */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            {/* Filters & actions */}
            <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Input 
                placeholder="Search name or email" 
                value={filters.q} 
                onChange={e => setFilters({...filters, q: e.target.value})}
                className="w-48"
              />
              <Input 
                placeholder="Min score" 
                type="number" 
                value={filters.minScore} 
                onChange={e => setFilters({...filters, minScore: e.target.value})}
                className="w-32"
              />
              <Input 
                placeholder="Max score" 
                type="number" 
                value={filters.maxScore} 
                onChange={e => setFilters({...filters, maxScore: e.target.value})}
                className="w-32"
              />
              <select 
                value={filters.status} 
                onChange={e => setFilters({...filters, status: e.target.value})} 
                className="border px-2 py-1 rounded w-40"
              >
                <option value="">All statuses</option>
                {Object.entries(statusLabels).map(([k,label]) => <option value={k} key={k}>{label}</option>)}
              </select>

              <select 
                value={filters.job_id} 
                onChange={e => setFilters({...filters, job_id: e.target.value})} 
                className="border px-2 py-1 rounded w-48"
              >
                <option value="">All jobs</option>
                {jobOpenings.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>

              <Button onClick={() => fetchApplications()}>Apply</Button>
              <Button variant="outline" onClick={() => { 
                setFilters({ q: '', minScore: '', maxScore: '', status: '', job_id: '' }); 
                fetchApplications({ q: '', minScore: '', maxScore: '', status: '', job_id: '' }); 
              }}>
                Reset
              </Button>

              <div className="ml-auto flex items-center space-x-2">
                <Button onClick={() => exportFiltered('xlsx')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export XLSX
                </Button>
                <Button variant="outline" onClick={() => exportFiltered('csv')}>
                  Export CSV
                </Button>
                {canModify && (
                  <>
                  
                    <Button onClick={() => bulkChangeStatus('hr_interview')}>Mark HR Interview</Button>
                    <Button onClick={() => bulkChangeStatus('technical_interview')}>Mark Technical Interview</Button>
                    <Button onClick={() => bulkChangeStatus('offered')}>Mark Offered</Button>
                    <Button onClick={() => bulkChangeStatus('rejected')}>Mark Rejected</Button>
  
                  </>
                )}
              </div>
            </div>

            {/* Pipeline columns */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {(['Applied','Screening','Interview','Hired'] as const).map((bucket) => (
    <div key={bucket} className="card p-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {bucket} ({appsInBucket(bucket).length})
        </h3>
        {canModify && (
          <button
            className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-white"
            onClick={() => selectAllInBucket(bucket)}
          >
            Select all
          </button>
        )}
      </div>

      {/* Candidates */}
      <div className="space-y-3 relative">
        {loadingApps && <div className="text-sm text-gray-500">Loading...</div>}
        {!loadingApps && appsInBucket(bucket).length === 0 && (
          <div className="text-sm text-center text-gray-400 pt-4">No candidates</div>
        )}

        {appsInBucket(bucket).map((app: Application, index: number) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow relative"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Candidate Info */}
              <div className="flex items-start gap-3">
                {canModify && (
                  <input
                    type="checkbox"
                    checked={!!selected[app.id]}
                    onChange={() => toggleSelect(app.id)}
                    className="mt-1"
                  />
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {app.full_name || app.email}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{app.email}</p>
                  <div className="text-xs text-gray-500">
                    Resume: {app.resume_score ?? '-'} • GitHub: {app.github_score ?? '-'} • Technical: {app.technical_interview_score ?? '-'} • HR: {app.hr_interview_score ?? '-'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : '-'}
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    {statusLabels[app.status] || app.status}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end space-y-2 relative">
                {/* View Candidate */}
                <button
                  onClick={() => { setViewJob(app as any); setShowViewDialog(true); }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Change Status Dropdown */}
                {canModify && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setDropdownOpen(prev => ({ ...prev, [app.id]: !prev[app.id] }))
                      }
                      className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-2 py-1 bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                    >
                      Change Status
                      <svg
                        className="-mr-1 ml-1 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {dropdownOpen[app.id] && (
                      <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1 flex flex-col">
                          {['submitted', 'hr_interview', 'technical_interview', 'offered', 'rejected'].map(statusOption => (
                            <button
                              key={statusOption}
                              onClick={() => { changeStatusSingle(app.id, statusOption); setDropdownOpen(prev => ({ ...prev, [app.id]: false })); }}
                              className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              {statusLabels[statusOption as keyof typeof statusLabels] || statusOption}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  ))}
</div>

          </div>
        )}
        
        {/* Interviews Tab
        {activeTab === 'interviews' && (
          <div className="text-center py-16 card">
            <Calendar className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Interview Data Not Available</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The interviews API endpoint is not yet active.</p>
          </div>
        )} */}
      </div>

      {/* Create Job Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl w-full sm:w-[90%] md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Job Opening</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2">
            <div className="w-full">
              <Label>Title *</Label>
              <Input
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter job title"
              />
            </div>
            <div className="w-full">
              <Label>Department *</Label>
              <Input
                value={formData.department || ''}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>
            <div className="w-full">
              <Label>Location *</Label>
              <Input
                value={formData.location || ''}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div className="w-full">
              <Label>Employment Type *</Label>
              <select
                value={formData.employment_type || 'Full-time'}
                onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                className="w-full border rounded px-2 py-1"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div className="w-full">
              <Label>Salary Range</Label>
              <Input
                value={formData.salary_range || ''}
                onChange={e => setFormData({ ...formData, salary_range: e.target.value })}
                placeholder="e.g., 50k-70k"
              />
            </div>
            <div className="w-full md:col-span-2">
              <Label>Description</Label>
              <textarea
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter job description"
                className="w-full border rounded px-2 py-1 h-24"
              />
            </div>
            <div className="w-full md:col-span-2">
              <Label>Requirements (JSON format)</Label>
              <textarea
                value={requirementsText}
                onChange={e => setRequirementsText(e.target.value)}
                placeholder='e.g., {"skills":["JS","React"]}'
                className="w-full border rounded px-2 py-1 h-24 font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSaveJob}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Job/Application Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {viewJob && 'title' in viewJob ? 'Job Details' : 'Application Details'}
            </DialogTitle>
          </DialogHeader>
          {viewJob && (
            <div className="grid gap-3 py-4 max-h-96 overflow-y-auto">
              {'title' in viewJob ? (
                // Job Details
                <>
                  <p><strong>Title:</strong> {viewJob.title}</p>
                  <p><strong>Department:</strong> {viewJob.department}</p>
                  <p><strong>Location:</strong> {viewJob.location}</p>
                  <p><strong>Employment Type:</strong> {viewJob.type}</p>
                  <p><strong>Salary Range:</strong> {viewJob.salary}</p>
                  <p><strong>Status:</strong> {viewJob.status}</p>
                  <p><strong>Description:</strong> {viewJob.description}</p>
                  <div>
                    <strong>Requirements:</strong> 
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(viewJob.requirements, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                // Application Details
                <>
                      <p><strong>Name:</strong> {viewJob.full_name}</p>
                      <p><strong>Email:</strong> {viewJob.email}</p>
                      <p><strong>Status:</strong> {statusLabels[viewJob.status as keyof typeof statusLabels] || viewJob.status}</p>
                      <p><strong>Resume Score:</strong> {viewJob.resume_score ?? 'Not scored'}</p>
                      <p><strong>GitHub Score:</strong> {viewJob.github_score ?? 'Not scored'}</p>
                      <p><strong>Technical Interview Score:</strong> {viewJob.technical_interview_score ?? 'Not scored'}</p>
                      <p><strong>HR Interview Score:</strong> {viewJob.hr_interview_score ?? 'Not scored'}</p>
                      <p><strong>Applied:</strong> {viewJob.created_at ? new Date(viewJob.created_at).toLocaleDateString() : '-'}</p>
                      <p><strong>Job ID:</strong> {viewJob.job_id}</p>

                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}