<<<<<<< HEAD
'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle,
  MessageCircle,
  Target
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  goalsProgress: number
  reviewStatus: 'pending' | 'completed' | 'overdue'
  performance: 'exceeding' | 'meeting' | 'needs-improvement'
  lastReviewDate: string
  keyMetrics: {
    goalCompletion: number
    peerFeedback: number
    skillsGrowth: number
  }
}

export default function TeamOverview() {
  // Sample team data
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'John Doe',
      role: 'Senior Developer',
      goalsProgress: 85,
      reviewStatus: 'pending',
      performance: 'exceeding',
      lastReviewDate: '2025-07-15',
      keyMetrics: {
        goalCompletion: 85,
        peerFeedback: 4.5,
        skillsGrowth: 15
      }
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'Product Designer',
      goalsProgress: 92,
      reviewStatus: 'completed',
      performance: 'exceeding',
      lastReviewDate: '2025-09-01',
      keyMetrics: {
        goalCompletion: 92,
        peerFeedback: 4.8,
        skillsGrowth: 20
      }
    },
    {
      id: '3',
      name: 'Mike Johnson',
      role: 'Developer',
      goalsProgress: 65,
      reviewStatus: 'overdue',
      performance: 'needs-improvement',
      lastReviewDate: '2025-05-30',
      keyMetrics: {
        goalCompletion: 65,
        peerFeedback: 3.5,
        skillsGrowth: 5
      }
    }
  ]

  const getPerformanceIcon = (performance: TeamMember['performance']) => {
    switch (performance) {
      case 'exceeding':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'meeting':
        return <Minus className="w-5 h-5 text-blue-500" />
      case 'needs-improvement':
        return <TrendingDown className="w-5 h-5 text-red-500" />
    }
  }

  const getReviewStatusColor = (status: TeamMember['reviewStatus']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'overdue':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Team Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Performers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Goal Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">81%</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Need Attention</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Goals Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Review Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {teamMembers.map((member) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-900"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {member.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-32">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 dark:text-white mr-2">
                          {member.goalsProgress}%
                        </span>
                        <div className="flex-grow h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${member.goalsProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getReviewStatusColor(member.reviewStatus)}`}>
                      {member.reviewStatus.charAt(0).toUpperCase() + member.reviewStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPerformanceIcon(member.performance)}
                      <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                        {member.performance.replace('-', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                      Review
                    </button>
                    <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                      Goals
                    </button>
                    <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                      Feedback
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            💡 Team Insights
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• The team is showing strong performance in technical skills</p>
            <p>• Consider organizing a session to share best practices</p>
            <p>• One team member may need additional support</p>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            📊 Review Progress
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Reviews Completed</span>
              <span className="text-gray-900 dark:text-white">1/3</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-full w-1/3 bg-primary-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
=======
'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle,
  MessageCircle,
  Target
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  goalsProgress: number
  reviewStatus: 'pending' | 'completed' | 'overdue'
  performance: 'exceeding' | 'meeting' | 'needs-improvement'
  lastReviewDate: string
  keyMetrics: {
    goalCompletion: number
    peerFeedback: number
    skillsGrowth: number
  }
}

export default function TeamOverview() {
  // Sample team data
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'John Doe',
      role: 'Senior Developer',
      goalsProgress: 85,
      reviewStatus: 'pending',
      performance: 'exceeding',
      lastReviewDate: '2025-07-15',
      keyMetrics: {
        goalCompletion: 85,
        peerFeedback: 4.5,
        skillsGrowth: 15
      }
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'Product Designer',
      goalsProgress: 92,
      reviewStatus: 'completed',
      performance: 'exceeding',
      lastReviewDate: '2025-09-01',
      keyMetrics: {
        goalCompletion: 92,
        peerFeedback: 4.8,
        skillsGrowth: 20
      }
    },
    {
      id: '3',
      name: 'Mike Johnson',
      role: 'Developer',
      goalsProgress: 65,
      reviewStatus: 'overdue',
      performance: 'needs-improvement',
      lastReviewDate: '2025-05-30',
      keyMetrics: {
        goalCompletion: 65,
        peerFeedback: 3.5,
        skillsGrowth: 5
      }
    }
  ]

  const getPerformanceIcon = (performance: TeamMember['performance']) => {
    switch (performance) {
      case 'exceeding':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'meeting':
        return <Minus className="w-5 h-5 text-blue-500" />
      case 'needs-improvement':
        return <TrendingDown className="w-5 h-5 text-red-500" />
    }
  }

  const getReviewStatusColor = (status: TeamMember['reviewStatus']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'overdue':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Team Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Performers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Goal Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">81%</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Need Attention</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Goals Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Review Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {teamMembers.map((member) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-900"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {member.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-32">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 dark:text-white mr-2">
                          {member.goalsProgress}%
                        </span>
                        <div className="flex-grow h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${member.goalsProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getReviewStatusColor(member.reviewStatus)}`}>
                      {member.reviewStatus.charAt(0).toUpperCase() + member.reviewStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPerformanceIcon(member.performance)}
                      <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                        {member.performance.replace('-', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                      Review
                    </button>
                    <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                      Goals
                    </button>
                    <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                      Feedback
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            💡 Team Insights
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• The team is showing strong performance in technical skills</p>
            <p>• Consider organizing a session to share best practices</p>
            <p>• One team member may need additional support</p>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            📊 Review Progress
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Reviews Completed</span>
              <span className="text-gray-900 dark:text-white">1/3</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-full w-1/3 bg-primary-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
}