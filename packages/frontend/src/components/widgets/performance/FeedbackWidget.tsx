'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ThumbsUp, Star, Flag } from 'lucide-react'

interface Feedback {
  id: string
  type: 'praise' | 'suggestion' | 'milestone' | 'recognition'
  from: string
  message: string
  date: string
  context?: string
  rating?: number
}

export default function FeedbackWidget() {
  // Sample feedback data
  const feedbackList: Feedback[] = [
    {
      id: '1',
      type: 'praise',
      from: 'Sarah Manager',
      message: 'Excellent work on the customer onboarding improvements. The reduced support tickets are a testament to your effective solutions.',
      date: '2025-10-02',
      context: 'Project: Customer Onboarding Enhancement'
    },
    {
      id: '2',
      type: 'suggestion',
      from: 'John Lead',
      message: 'Consider documenting your process improvements for team knowledge sharing. Your insights could help others.',
      date: '2025-10-01',
      context: 'Weekly 1:1'
    },
    {
      id: '3',
      type: 'milestone',
      from: 'System',
      message: 'Congratulations on completing your Advanced Certification!',
      date: '2025-09-30',
      rating: 5
    }
  ]

  const getTypeIcon = (type: Feedback['type']) => {
    switch (type) {
      case 'praise':
        return <ThumbsUp className="w-5 h-5 text-green-500" />
      case 'suggestion':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'milestone':
        return <Flag className="w-5 h-5 text-purple-500" />
      case 'recognition':
        return <Star className="w-5 h-5 text-yellow-500" />
    }
  }

  const getTypeStyles = (type: Feedback['type']) => {
    switch (type) {
      case 'praise':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'suggestion':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'milestone':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      case 'recognition':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">12</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Positive Feedback</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Constructive Feedback</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">4.8</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
        </div>
      </div>

      {/* Feedback Timeline */}
      <div className="space-y-4">
        {feedbackList.map((feedback, index) => (
          <motion.div
            key={feedback.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getTypeStyles(feedback.type)}`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getTypeIcon(feedback.type)}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {feedback.from}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(feedback.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-gray-700 dark:text-gray-300">
                  {feedback.message}
                </p>
                {feedback.context && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {feedback.context}
                  </p>
                )}
                {feedback.rating && (
                  <div className="mt-2 flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < feedback.rating!
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Request Feedback Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full p-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center"
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        Request Feedback
      </motion.button>

      {/* AI Insights */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          💡 AI Feedback Analysis
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>• Your communication skills are frequently praised</p>
          <p>• Recent feedback shows strong technical growth</p>
          <p>• Consider seeking more feedback on project management</p>
        </div>
      </div>
    </div>
  )
}