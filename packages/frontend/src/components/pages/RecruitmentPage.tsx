'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  Users, 
  Eye, 
  MessageSquare,
  CheckCircle,
  Calendar,
  Star,
  MapPin,
  Clock
} from 'lucide-react'

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'openings' | 'pipeline' | 'interviews'>('openings')

  const jobOpenings = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      status: 'Active',
      applicants: 45,
      postedDate: '2024-10-15',
      salary: '$90,000 - $120,000'
    },
    {
      id: '2',
      title: 'HR Coordinator',
      department: 'Human Resources',
      location: 'New York',
      type: 'Full-time',
      status: 'Active',
      applicants: 23,
      postedDate: '2024-10-12',
      salary: '$55,000 - $70,000'
    },
    {
      id: '3',
      title: 'Data Scientist',
      department: 'Engineering',
      location: 'San Francisco',
      type: 'Full-time',
      status: 'Active',
      applicants: 67,
      postedDate: '2024-10-10',
      salary: '$100,000 - $140,000'
    }
  ]

  const candidates = [
    {
      id: '1',
      name: 'Alice Chen',
      position: 'Senior Frontend Developer',
      email: 'alice.chen@email.com',
      stage: 'Interview',
      aiScore: 88,
      experience: '5 years',
      appliedDate: '2024-10-20'
    },
    {
      id: '2',
      name: 'David Rodriguez',
      position: 'HR Coordinator',
      email: 'david.r@email.com',
      stage: 'Screening',
      aiScore: 76,
      experience: '3 years',
      appliedDate: '2024-10-18'
    },
    {
      id: '3',
      name: 'Maria Garcia',
      position: 'Data Scientist',
      email: 'maria.g@email.com',
      stage: 'Applied',
      aiScore: 92,
      experience: '7 years',
      appliedDate: '2024-10-22'
    }
  ]

  const interviews = [
    {
      id: '1',
      candidate: 'Alice Chen',
      position: 'Senior Frontend Developer',
      date: '2024-10-25',
      time: '10:00 AM',
      interviewer: 'John Doe',
      type: 'Technical',
      status: 'Scheduled'
    },
    {
      id: '2',
      candidate: 'Bob Smith',
      position: 'Backend Developer',
      date: '2024-10-26',
      time: '2:00 PM',
      interviewer: 'Sarah Wilson',
      type: 'Behavioral',
      status: 'Confirmed'
    }
  ]

  const getStageColor = (stage: string) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Screening': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Interview': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'Hired': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    }
    return colors[stage as keyof typeof colors] || colors.Applied
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Paused': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      'Scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Confirmed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    }
    return colors[status as keyof typeof colors] || colors.Active
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recruitment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage job openings, candidates, and hiring pipeline
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Create Job Opening</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Open Positions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {jobOpenings.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Applicants
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {jobOpenings.reduce((sum, job) => sum + job.applicants, 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Interviews
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {interviews.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                AI Processing
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                15
              </p>
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
            { id: 'interviews', label: 'Interviews', icon: Calendar }
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {job.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{job.applicants} applicants</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Salary: {job.salary} • Posted: {new Date(job.postedDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                      View Applications
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {['Applied', 'Screening', 'Interview', 'Hired'].map((stage) => (
              <div key={stage} className="card p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {stage} ({candidates.filter(c => c.stage === stage).length})
                </h3>
                <div className="space-y-3">
                  {candidates
                    .filter(candidate => candidate.stage === stage)
                    .map((candidate, index) => (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {candidate.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {candidate.position}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            AI Score: {candidate.aiScore}%
                          </span>
                          <div className="flex items-center space-x-1">
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <Eye className="w-3 h-3" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-primary-600">
                              <MessageSquare className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'interviews' && (
          <div className="space-y-4">
            {interviews.map((interview, index) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {interview.candidate}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {interview.position}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {interview.date} at {interview.time}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      with {interview.interviewer}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                      {interview.status}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {interview.type}
                    </span>
                    <button className="text-primary-600 dark:text-primary-400 hover:underline text-sm">
                      Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
