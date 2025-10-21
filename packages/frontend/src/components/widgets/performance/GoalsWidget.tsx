'use client'
export const dynamic = 'force-dynamic';
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, ChevronRight, Flag, CheckCircle, AlertCircle } from 'lucide-react'

interface Goal {
  id: string
  objective: string
  keyResults: Array<{
    id: string
    description: string
    progress: number
    target: number
    unit: string
  }>
  dueDate: string
  status: 'on-track' | 'at-risk' | 'completed' | 'not-started'
  category: 'professional' | 'personal' | 'team' | 'company'
}

interface GoalsWidgetProps {
  isManager?: boolean
}

export default function GoalsWidget({ isManager = false }: GoalsWidgetProps) {
  const [activeGoal, setActiveGoal] = useState<string | null>(null)

  // Sample goals data
  const goals: Goal[] = [
    {
      id: '1',
      objective: 'Enhance Customer Onboarding Experience',
      keyResults: [
        {
          id: 'kr1',
          description: 'Reduce onboarding support tickets',
          progress: 15,
          target: 20,
          unit: '%'
        },
        {
          id: 'kr2',
          description: 'Achieve onboarding satisfaction rating',
          progress: 92,
          target: 95,
          unit: '%'
        },
        {
          id: 'kr3',
          description: 'Decrease average onboarding time',
          progress: 3,
          target: 5,
          unit: 'days'
        }
      ],
      dueDate: '2025-12-31',
      status: 'on-track',
      category: 'team'
    },
    {
      id: '2',
      objective: 'Improve Technical Skills',
      keyResults: [
        {
          id: 'kr4',
          description: 'Complete advanced certification',
          progress: 1,
          target: 1,
          unit: 'certifications'
        },
        {
          id: 'kr5',
          description: 'Contribute to open source projects',
          progress: 3,
          target: 5,
          unit: 'contributions'
        }
      ],
      dueDate: '2025-12-31',
      status: 'at-risk',
      category: 'personal'
    }
  ]

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'on-track':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
      case 'at-risk':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
      case 'completed':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
    }
  }

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-4 h-4" />
      case 'at-risk':
        return <AlertCircle className="w-4 h-4" />
      case 'completed':
        return <Flag className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const getAIFeedback = (goal: Goal) => {
    const progress = goal.keyResults.reduce((acc, kr) => acc + (kr.progress / kr.target) * 100, 0) / goal.keyResults.length

    if (progress >= 80) {
      return "You're making excellent progress! Consider setting more challenging targets for next quarter."
    } else if (progress >= 50) {
      return "You're on track but might need to accelerate progress on some key results."
    } else {
      return "Consider breaking down your key results into smaller, more manageable milestones."
    }
  }

  return (
    <div className="space-y-6">
      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            {/* Goal Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {goal.objective}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Due: {new Date(goal.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-sm flex items-center space-x-1 ${getStatusColor(goal.status)}`}>
                {getStatusIcon(goal.status)}
                <span className="capitalize">{goal.status.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Key Results */}
            <div className="space-y-4">
              {goal.keyResults.map((kr) => (
                <div key={kr.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{kr.description}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {kr.progress} / {kr.target} {kr.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500"
                      style={{ width: `${(kr.progress / kr.target) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Feedback */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                💡 {getAIFeedback(goal)}
              </p>
            </div>

            {isManager && (
              <div className="mt-4 flex justify-end space-x-3">
                <button className="px-3 py-1 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
                  Provide Feedback
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                  Adjust Goals
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Add Goal Button */}
      <button className="w-full p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-center">
          <Target className="w-5 h-5 mr-2" />
          <span>{isManager ? 'Add Team Goal' : 'Add Personal Goal'}</span>
        </div>
      </button>

      {/* AI Goal Assistant Tip */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ✨ Try our AI Goal Assistant! Type your objective and get smart suggestions for measurable key results.
        </p>
      </div>
    </div>
  )
}