export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: {
    skills?: string[];
    experience_years?: number;
    education?: string;
    [key: string]: any;
  };
  department: string;
  location: string;
  employment_type: string;
  salary_range?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus =
  | 'submitted'
  | 'resume_screening'
  | 'github_analysis'
  | 'technical_interview'
  | 'hr_interview'
  | 'offer'
  | 'rejected';

export interface Application {
  id: string;
  profile_id: string;
  job_id: string;
  status: ApplicationStatus;
  resume_url?: string;
  resume_score: number;
  resume_analysis: any;
  github_score: number;
  github_analysis: any;
  technical_interview_transcript: any[];
  technical_interview_score: number;
  hr_interview_transcript: any[];
  hr_interview_summary?: string;
  hr_interview_score: number;
  education: {
    college?: string;
    gpa?: number;
    degree?: string;
    graduation_year?: number;
  };
  experience: {
    previous_roles?: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
  };
  created_at: string;
  updated_at: string;
  job?: Job;
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  test_cases: Array<{
    input: any;
    expected_output: any;
  }>;
  starter_code: {
    [language: string]: string;
  };
  solution?: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
