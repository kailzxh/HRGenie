/*
  # AI Hiring Platform - Initial Database Schema

  ## Overview
  This migration creates the core database structure for an AI-powered hiring platform
  that automates resume screening, technical interviews, and HR interviews using GCP AI agents.

  ## New Tables

  ### 1. `profiles`
  Stores extended user information linked to Supabase Auth users.
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - Candidate's full name
  - `phone` (text) - Contact number
  - `linkedin_url` (text) - LinkedIn profile URL
  - `github_url` (text) - GitHub profile URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### 2. `jobs`
  Stores job postings with requirements and descriptions.
  - `id` (uuid, primary key)
  - `title` (text) - Job title
  - `description` (text) - Full job description
  - `requirements` (jsonb) - Structured requirements (skills, experience, education)
  - `department` (text) - Department/team
  - `location` (text) - Job location
  - `employment_type` (text) - Full-time, Part-time, Contract, etc.
  - `salary_range` (text) - Salary information
  - `is_active` (boolean) - Whether job is currently open
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `applications`
  Links candidates to jobs and tracks the entire hiring pipeline.
  - `id` (uuid, primary key)
  - `profile_id` (uuid) - References profiles
  - `job_id` (uuid) - References jobs
  - `status` (text) - Current stage: 'submitted', 'resume_screening', 'github_analysis', 
                      'technical_interview', 'hr_interview', 'offer', 'rejected'
  - `resume_url` (text) - Supabase Storage URL for resume
  - `resume_score` (integer) - AI-calculated match score (0-100)
  - `resume_analysis` (jsonb) - Parsed resume data from Gemini
  - `github_score` (integer) - GitHub profile analysis score (0-100)
  - `github_analysis` (jsonb) - Code quality metrics from GCP
  - `technical_interview_transcript` (jsonb) - Chat history with technical AI agent
  - `technical_interview_score` (integer) - Score from technical round (0-100)
  - `hr_interview_transcript` (jsonb) - Chat history with HR AI agent
  - `hr_interview_summary` (text) - AI-generated summary of behavioral interview
  - `hr_interview_score` (integer) - Score from HR round (0-100)
  - `education` (jsonb) - College, GPA, degree information
  - `experience` (jsonb) - Previous roles and responsibilities
  - `created_at` (timestamptz) - Application submission date
  - `updated_at` (timestamptz)

  ### 4. `coding_challenges`
  Question bank for technical interviews.
  - `id` (uuid, primary key)
  - `title` (text) - Problem title
  - `description` (text) - Problem statement
  - `difficulty` (text) - 'easy', 'medium', 'hard'
  - `topic` (text) - 'arrays', 'strings', 'dynamic_programming', etc.
  - `test_cases` (jsonb) - Array of {input, expected_output}
  - `starter_code` (jsonb) - Code templates by language
  - `solution` (text) - Reference solution
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Profiles: Users can only read/update their own profile
  - Jobs: Public read access, admin-only write access
  - Applications: Users can only access their own applications
  - Coding Challenges: Read-only access for all authenticated users
*/

-- Create profiles table
-- Create profiles table in onboarding schema
CREATE TABLE IF NOT EXISTS onboarding.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  linkedin_url text,
  github_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON onboarding.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON onboarding.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON onboarding.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create jobs table
CREATE TABLE IF NOT EXISTS onboarding.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  requirements jsonb DEFAULT '{}'::jsonb,
  department text NOT NULL,
  location text NOT NULL,
  employment_type text DEFAULT 'Full-time',
  salary_range text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs"
  ON onboarding.jobs FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create applications table
CREATE TABLE IF NOT EXISTS onboarding.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES onboarding.profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES onboarding.jobs(id) ON DELETE CASCADE,
  status text DEFAULT 'submitted',
  resume_url text,
  resume_score integer DEFAULT 0,
  resume_analysis jsonb DEFAULT '{}'::jsonb,
  github_score integer DEFAULT 0,
  github_analysis jsonb DEFAULT '{}'::jsonb,
  technical_interview_transcript jsonb DEFAULT '[]'::jsonb,
  technical_interview_score integer DEFAULT 0,
  hr_interview_transcript jsonb DEFAULT '[]'::jsonb,
  hr_interview_summary text,
  hr_interview_score integer DEFAULT 0,
  education jsonb DEFAULT '{}'::jsonb,
  experience jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, job_id)
);

ALTER TABLE onboarding.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON onboarding.applications FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own applications"
  ON onboarding.applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own applications"
  ON onboarding.applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Create coding_challenges table
CREATE TABLE IF NOT EXISTS onboarding.coding_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic text NOT NULL,
  test_cases jsonb DEFAULT '[]'::jsonb,
  starter_code jsonb DEFAULT '{}'::jsonb,
  solution text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding.coding_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view challenges"
  ON onboarding.coding_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_applications_profile_id ON onboarding.applications(profile_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_applications_job_id ON onboarding.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_applications_status ON onboarding.applications(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_jobs_is_active ON onboarding.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_onboarding_coding_challenges_difficulty ON onboarding.coding_challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_onboarding_coding_challenges_topic ON onboarding.coding_challenges(topic);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION onboarding.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON onboarding.profiles
  FOR EACH ROW
  EXECUTE FUNCTION onboarding.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON onboarding.jobs
  FOR EACH ROW
  EXECUTE FUNCTION onboarding.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON onboarding.applications
  FOR EACH ROW
  EXECUTE FUNCTION onboarding.update_updated_at_column();
