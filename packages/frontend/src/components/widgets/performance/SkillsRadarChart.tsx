'use client'
export const dynamic = 'force-dynamic';
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Target } from 'lucide-react'

interface Skill {
  category: string
  skills: Array<{
    name: string
    current: number
    required: number
    trending: 'up' | 'down' | 'stable'
  }>
}

export default function SkillsRadarChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const skillsData: Skill[] = [
    {
      category: 'Technical',
      skills: [
        { name: 'Programming', current: 85, required: 80, trending: 'up' },
        { name: 'System Design', current: 75, required: 70, trending: 'up' },
        { name: 'DevOps', current: 60, required: 65, trending: 'up' }
      ]
    },
    {
      category: 'Leadership',
      skills: [
        { name: 'Team Management', current: 70, required: 75, trending: 'up' },
        { name: 'Communication', current: 85, required: 80, trending: 'stable' },
        { name: 'Strategic Thinking', current: 65, required: 70, trending: 'up' }
      ]
    },
    {
      category: 'Professional',
      skills: [
        { name: 'Project Management', current: 80, required: 75, trending: 'stable' },
        { name: 'Problem Solving', current: 90, required: 85, trending: 'up' },
        { name: 'Innovation', current: 75, required: 80, trending: 'up' }
      ]
    }
  ]

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Calculate center point
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    // Draw radar chart background
    const totalSkills = skillsData.reduce((acc, cat) => acc + cat.skills.length, 0)
    const angleStep = (Math.PI * 2) / totalSkills

    // Draw circles
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath()
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw skill points and connect them
    ctx.beginPath()
    ctx.strokeStyle = '#6366f1'
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'
    ctx.lineWidth = 2

    let angle = -Math.PI / 2
    let firstPoint = true
    let firstX: number, firstY: number

    skillsData.forEach(category => {
      category.skills.forEach(skill => {
        const value = skill.current / 100
        const x = centerX + Math.cos(angle) * radius * value
        const y = centerY + Math.sin(angle) * radius * value

        if (firstPoint) {
          ctx.moveTo(x, y)
          firstPoint = false
          firstX = x
          firstY = y
        } else {
          ctx.lineTo(x, y)
        }

        angle += angleStep
      })
    })

    ctx.lineTo(firstX!, firstY!)
    ctx.stroke()
    ctx.fill()
  }, [skillsData])

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '📈'
      case 'down':
        return '📉'
      default:
        return '📊'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Skills Overview
          </h3>
          <canvas
            ref={canvasRef}
            className="w-full aspect-square"
          />
        </div>

        {/* Skills List */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Skills Breakdown
          </h3>
          <div className="space-y-6">
            {skillsData.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {category.category}
                </h4>
                <div className="space-y-3">
                  {category.skills.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {skill.name} {getTrendIcon(skill.trending)}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {skill.current}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500"
                          style={{ width: `${skill.current}%` }}
                        />
                      </div>
                      {skill.current < skill.required && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          Target: {skill.required}%
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Development Recommendations */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          AI-Powered Development Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
              Suggested Learning Paths
            </h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-300">
              <li className="flex items-center">
                <ChevronRight className="w-4 h-4 mr-1" />
                Advanced System Design Course
              </li>
              <li className="flex items-center">
                <ChevronRight className="w-4 h-4 mr-1" />
                Leadership Workshop Series
              </li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
              Growth Opportunities
            </h4>
            <ul className="space-y-2 text-sm text-green-600 dark:text-green-300">
              <li className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                Lead upcoming DevOps initiative
              </li>
              <li className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                Mentor junior team members
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}