import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

// ---- Types ----
export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  employment_type: string;
  salary_range?: string;
}

interface JobsPageProps {
  initialJobs?: Job[];
}

// ---- UI Components ----
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition ${props.className}`}
  >
    {children}
  </button>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...props
}) => (
  <input
    {...props}
    className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 outline-none ${className}`}
  />
);

const Select: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}> = ({ value, onChange, options, placeholder }) => (
  <select
    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 outline-none"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="all">All {placeholder}</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full">
    {children}
  </span>
);

// ---- Main Component ----
export const JobsPage: React.FC<JobsPageProps> = ({ initialJobs = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(initialJobs);
  const [loading, setLoading] = useState(!initialJobs.length);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Fetch jobs from Supabase if initialJobs is empty
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs(data || []);
        setFilteredJobs(data || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!initialJobs.length) fetchJobs();
  }, [initialJobs]);

  // Filter jobs based on search & filters
  useEffect(() => {
    let filtered = jobs;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q)
      );
    }
    if (departmentFilter !== 'all')
      filtered = filtered.filter((job) => job.department === departmentFilter);
    if (locationFilter !== 'all')
      filtered = filtered.filter((job) => job.location === locationFilter);

    setFilteredJobs(filtered);
  }, [searchQuery, departmentFilter, locationFilter, jobs]);

  const departments = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.department))),
    [jobs]
  );
  const locations = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.location))),
    [jobs]
  );

  if (!user) return <p className="text-center py-12">Please login to view jobs.</p>;
  if (loading) return <p className="text-center py-12">Loading jobs...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Open Positions</h1>
        <p className="text-gray-600">Find your next opportunity with AI-powered hiring</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={departments}
            placeholder="Departments"
          />
          <Select
            value={locationFilter}
            onChange={setLocationFilter}
            options={locations}
            placeholder="Locations"
          />
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length === 0 ? (
          <p className="col-span-full text-center text-gray-600 py-12">
            No jobs found matching your criteria.
          </p>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="border rounded-xl shadow-sm p-6 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <div className="flex items-center text-gray-600 mt-1 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              <p className="text-sm text-gray-700 line-clamp-3 mb-3">{job.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge>
                  <Briefcase className="inline h-3 w-3 mr-1" />
                  {job.department}
                </Badge>
                <Badge>{job.employment_type}</Badge>
                {job.salary_range && (
                  <Badge>
                    <DollarSign className="inline h-3 w-3 mr-1" />
                    {job.salary_range}
                  </Badge>
                )}
              </div>

              <Button className="w-full" onClick={() => navigate(`/jobs/${job.id}/apply`)}>
                Apply Now
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
