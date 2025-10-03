'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  TrendingUp, 
  Users, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Star
} from 'lucide-react'

interface Employee {
  id: string
  name: string
  role: string
  department: string
  performance: number
  potential: number
  currentBox: number
  reviewScore: number
  manager: string
  keyStrengths: string[]
  developmentAreas: string[]
}

export default function PerformanceCalibration() {
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedBox, setSelectedBox] = useState<number | null>(null)

  // Sample calibration data
  const employees: Employee[] = [
    {
      id: '1',
      name: 'John Doe',
      role: 'Senior Developer',
      department: 'Engineering',
      performance: 4.5,
      potential: 4.2,
      currentBox: 9,
      reviewScore: 4.5,
      manager: 'Sarah Manager',
      keyStrengths: ['Technical Leadership', 'Innovation', 'Problem Solving'],
      developmentAreas: ['Strategic Planning', 'Delegation']
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'Product Designer',
      department: 'Design',
      performance: 4.8,
      potential: 4.5,
      currentBox: 9,
      reviewScore: 4.8,
      manager: 'Mike Lead',
      keyStrengths: ['User Experience', 'Innovation', 'Communication'],
      developmentAreas: ['Technical Skills']
    },
    // Add more employees as needed
  ]

  const getNineBoxPosition = (performance: number, potential: number): number => {
    const pPerf = Math.round(performance)
    const pPot = Math.round(potential)
    
    // 9-box grid position calculation (1-9, where 9 is top-right)
    return ((pPot - 1) * 3) + pPerf
  }

  const getNineBoxColor = (box: number) => {
    if ([9, 8, 6].includes(box)) return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
    if ([7, 5, 3].includes(box)) return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
    return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
  }

  const getNineBoxLabel = (box: number) => {
    switch (box) {
      case 9: return 'Star'
      case 8: return 'High Performer'
      case 7: return 'High Potential'
      case 6: return 'Solid Performer'
      case 5: return 'Core Player'
      case 4: return 'Inconsistent'
      case 3: return 'Potential Gem'
      case 2: return 'Development Needed'
      case 1: return 'Risk'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Calibration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Performers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">30%</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Core Performers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">55%</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Need Development</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">15%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 9-Box Grid */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Performance vs. Potential Matrix</h3>
        <div className="grid grid-cols-3 gap-2">
          {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((box) => (
            <div
              key={box}
              className={`p-4 rounded-lg cursor-pointer ${
                selectedBox === box
                  ? 'ring-2 ring-primary-500'
                  : ''
              } ${getNineBoxColor(box)}`}
              onClick={() => setSelectedBox(box === selectedBox ? null : box)}
            >
              <div className="text-sm font-medium mb-2">{getNineBoxLabel(box)}</div>
              <div className="text-2xl font-bold">
                {employees.filter((e) => e.currentBox === box).length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee List */}
      {selectedBox && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Potential
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Manager
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {employees
                  .filter((emp) => emp.currentBox === selectedBox)
                  .map((emp) => (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white dark:bg-gray-900"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {emp.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {emp.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < emp.performance
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < emp.potential
                                  ? 'text-blue-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {emp.manager}
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          💡 Calibration Insights
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>• Distribution shows a healthy performance curve</p>
          <p>• Consider development programs for employees in boxes 1-3</p>
          <p>• High potential employees may need stretch assignments</p>
        </div>
      </div>

      {/* Bias Detection Alert */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
              Potential Bias Detected
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                The AI has detected potential unconscious bias in the following areas:
              </p>
              <ul className="list-disc list-inside mt-1">
                <li>Gender distribution in high performance ratings</li>
                <li>Age correlation with potential ratings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}