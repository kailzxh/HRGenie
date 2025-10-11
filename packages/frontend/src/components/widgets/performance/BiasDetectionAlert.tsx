<<<<<<< HEAD
'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface BiasDetectionData {
  category: string
  description: string
  severity: 'low' | 'medium' | 'high'
  affectedGroups: string[]
  recommendations: string[]
}

export default function BiasDetectionAlert() {
  const [isExpanded, setIsExpanded] = useState(false)

  const biasData: BiasDetectionData[] = [
    {
      category: 'Language Bias',
      description: 'Gendered language detected in performance reviews',
      severity: 'medium',
      affectedGroups: ['Women', 'Non-binary individuals'],
      recommendations: [
        'Use gender-neutral language in reviews',
        'Focus on specific behaviors and outcomes',
        'Review templates for inclusive language'
      ]
    },
    {
      category: 'Rating Distribution',
      description: 'Potential age-based rating patterns identified',
      severity: 'high',
      affectedGroups: ['Employees over 45', 'Early career professionals'],
      recommendations: [
        'Implement blind review processes',
        'Provide age bias training for managers',
        'Review rating criteria for age-neutral metrics'
      ]
    },
    {
      category: 'Promotion Patterns',
      description: 'Uneven distribution in career advancement opportunities',
      severity: 'medium',
      affectedGroups: ['Remote workers', 'Part-time employees'],
      recommendations: [
        'Standardize promotion criteria',
        'Review remote work policies',
        'Ensure equal visibility for all employees'
      ]
    }
  ]

  const getSeverityColor = (severity: BiasDetectionData['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
    }
  }

  return (
    <div className="card p-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Bias Detection Report
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-4 space-y-4"
        >
          {biasData.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {item.category}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(item.severity)}`}>
                  {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Affected Groups
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {item.affectedGroups.map((group) => (
                      <span
                        key={group}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recommendations
                  </h5>
                  <ul className="list-disc list-inside space-y-1">
                    {item.recommendations.map((rec) => (
                      <li key={rec} className="text-sm text-gray-600 dark:text-gray-400">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Action Plan */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
              Recommended Actions
            </h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-300">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Schedule bias awareness training for all managers
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Review and update performance review templates
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Implement blind review process for promotions
              </li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  )
=======
'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface BiasDetectionData {
  category: string
  description: string
  severity: 'low' | 'medium' | 'high'
  affectedGroups: string[]
  recommendations: string[]
}

export default function BiasDetectionAlert() {
  const [isExpanded, setIsExpanded] = useState(false)

  const biasData: BiasDetectionData[] = [
    {
      category: 'Language Bias',
      description: 'Gendered language detected in performance reviews',
      severity: 'medium',
      affectedGroups: ['Women', 'Non-binary individuals'],
      recommendations: [
        'Use gender-neutral language in reviews',
        'Focus on specific behaviors and outcomes',
        'Review templates for inclusive language'
      ]
    },
    {
      category: 'Rating Distribution',
      description: 'Potential age-based rating patterns identified',
      severity: 'high',
      affectedGroups: ['Employees over 45', 'Early career professionals'],
      recommendations: [
        'Implement blind review processes',
        'Provide age bias training for managers',
        'Review rating criteria for age-neutral metrics'
      ]
    },
    {
      category: 'Promotion Patterns',
      description: 'Uneven distribution in career advancement opportunities',
      severity: 'medium',
      affectedGroups: ['Remote workers', 'Part-time employees'],
      recommendations: [
        'Standardize promotion criteria',
        'Review remote work policies',
        'Ensure equal visibility for all employees'
      ]
    }
  ]

  const getSeverityColor = (severity: BiasDetectionData['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
    }
  }

  return (
    <div className="card p-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Bias Detection Report
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-4 space-y-4"
        >
          {biasData.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {item.category}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(item.severity)}`}>
                  {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Affected Groups
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {item.affectedGroups.map((group) => (
                      <span
                        key={group}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recommendations
                  </h5>
                  <ul className="list-disc list-inside space-y-1">
                    {item.recommendations.map((rec) => (
                      <li key={rec} className="text-sm text-gray-600 dark:text-gray-400">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Action Plan */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
              Recommended Actions
            </h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-300">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Schedule bias awareness training for all managers
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Review and update performance review templates
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Implement blind review process for promotions
              </li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  )
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
}