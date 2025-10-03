'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Clock, Check, X, ChevronDown, ChevronUp, Star } from 'lucide-react'

interface ReviewsWidgetProps {
  isManager?: boolean
}

interface Review {
  id: string
  type: 'annual' | 'quarterly' | 'probation' | 'project'
  period: string
  status: 'draft' | 'pending' | 'completed'
  overallRating: number
  competencies: Array<{
    name: string
    rating: number
    feedback: string
  }>
  goals: Array<{
    objective: string
    achievement: number
    feedback: string
  }>
  strengths: string[]
  improvements: string[]
  nextSteps: string[]
  reviewerComments?: string
  employeeName?: string
}

export default function ReviewsWidget({ isManager = false }: ReviewsWidgetProps) {
  const [expandedReview, setExpandedReview] = useState<string | null>(null)

  // Sample reviews data
  const reviews: Review[] = [
    {
      id: '1',
      type: 'quarterly',
      period: 'Q3 2025',
      status: 'pending',
      overallRating: 4.5,
      competencies: [
        {
          name: 'Technical Skills',
          rating: 4.5,
          feedback: 'Demonstrates strong technical capabilities and keeps up with new technologies.'
        },
        {
          name: 'Communication',
          rating: 4.0,
          feedback: 'Effectively communicates with team members and stakeholders.'
        },
        {
          name: 'Leadership',
          rating: 3.5,
          feedback: 'Shows potential for leadership, taking initiative on team projects.'
        }
      ],
      goals: [
        {
          objective: 'Improve Customer Onboarding',
          achievement: 85,
          feedback: 'Successfully reduced onboarding time and improved satisfaction scores.'
        },
        {
          objective: 'Technical Certification',
          achievement: 100,
          feedback: 'Completed advanced certification ahead of schedule.'
        }
      ],
      strengths: [
        'Strong problem-solving skills',
        'Excellent team collaboration',
        'High quality deliverables'
      ],
      improvements: [
        'Could take more initiative in leading team discussions',
        'Document processes more thoroughly'
      ],
      nextSteps: [
        'Take on more project leadership responsibilities',
        'Mentor junior team members',
        'Focus on system architecture skills'
      ],
      employeeName: isManager ? 'John Doe' : undefined
    },
    {
      id: '2',
      type: 'project',
      period: 'Project Alpha',
      status: 'completed',
      overallRating: 4.8,
      competencies: [
        {
          name: 'Project Management',
          rating: 5.0,
          feedback: 'Excellent project coordination and delivery.'
        },
        {
          name: 'Technical Expertise',
          rating: 4.5,
          feedback: 'Strong technical solutions and architecture decisions.'
        }
      ],
      goals: [
        {
          objective: 'Project Delivery',
          achievement: 100,
          feedback: 'Delivered on time and within scope.'
        }
      ],
      strengths: [
        'Strong project management',
        'Technical leadership'
      ],
      improvements: [
        'Could improve documentation practices'
      ],
      nextSteps: [
        'Take on larger project scope',
        'Share knowledge with team'
      ],
      employeeName: isManager ? 'Jane Smith' : undefined
    }
  ]

  const getStatusColor = (status: Review['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
    }
  }

  const getStatusIcon = (status: Review['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            {/* Review Header */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedReview(
                expandedReview === review.id ? null : review.id
              )}
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {review.type.charAt(0).toUpperCase() + review.type.slice(1)} Review - {review.period}
                </h3>
                {isManager && review.employeeName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Employee: {review.employeeName}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className={`px-2 py-1 rounded-full text-sm flex items-center space-x-1 ${getStatusColor(review.status)}`}>
                  {getStatusIcon(review.status)}
                  <span className="capitalize">{review.status}</span>
                </div>
                {expandedReview === review.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded Review Content */}
            {expandedReview === review.id && (
              <div className="mt-6 space-y-6">
                {/* Overall Rating */}
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-medium">Overall Rating:</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.overallRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium">{review.overallRating}</span>
                </div>

                {/* Competencies */}
                <div>
                  <h4 className="text-md font-medium mb-3">Competencies</h4>
                  <div className="space-y-4">
                    {review.competencies.map((comp) => (
                      <div key={comp.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{comp.name}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < comp.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {comp.feedback}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <h4 className="text-md font-medium mb-3">Goals Achievement</h4>
                  <div className="space-y-4">
                    {review.goals.map((goal) => (
                      <div key={goal.objective} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{goal.objective}</span>
                          <span>{goal.achievement}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500"
                            style={{ width: `${goal.achievement}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {goal.feedback}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-md font-medium mb-3">Key Strengths</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {review.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-md font-medium mb-3">Areas for Improvement</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {review.improvements.map((improvement, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h4 className="text-md font-medium mb-3">Next Steps</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {review.nextSteps.map((step, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  {review.status === 'pending' && (
                    isManager ? (
                      <>
                        <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
                          Complete Review
                        </button>
                        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                          Request Changes
                        </button>
                      </>
                    ) : (
                      <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
                        Submit Self-Assessment
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* AI Assistant */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          💡 AI Review Assistant
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>• Writing tip: Focus on specific examples and measurable achievements</p>
          <p>• Remember to highlight cross-functional collaboration</p>
          <p>• Consider mentioning your mentorship activities</p>
        </div>
      </div>
    </div>
  )
}