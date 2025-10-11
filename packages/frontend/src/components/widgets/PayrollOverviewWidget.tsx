'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Calendar, Users } from 'lucide-react'

export default function PayrollOverviewWidget() {
  const payrollData = {
    totalPayroll: 2847350,
    employeeCount: 1247,
    averageSalary: 78000,
    lastProcessed: 'Oct 1, 2024',
    status: 'completed',
    nextPayroll: 'Nov 1, 2024'
  }

  const breakdown = [
    {
      category: 'Basic Salary',
      amount: 2200000,
      percentage: 77.3,
      color: 'bg-blue-500'
    },
    {
      category: 'Allowances',
      amount: 425000,
      percentage: 14.9,
      color: 'bg-green-500'
    },
    {
      category: 'Bonuses',
      amount: 222350,
      percentage: 7.8,
      color: 'bg-purple-500'
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Payroll Overview
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            payrollData.status === 'completed' ? 'bg-green-500' : 
            payrollData.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-500 capitalize">
            {payrollData.status}
          </span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Payroll
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(payrollData.totalPayroll)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average Salary
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(payrollData.averageSalary)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Payroll Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Payroll Breakdown
        </h4>
        <div className="space-y-3">
          {breakdown.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${item.color} rounded-full`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.category}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(item.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {item.percentage}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Visual Breakdown */}
      <div className="mb-6">
        <div className="flex rounded-lg overflow-hidden h-3">
          {breakdown.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ width: 0 }}
              animate={{ width: `${item.percentage}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
              className={item.color}
            />
          ))}
        </div>
      </div>

      {/* Schedule Info */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              Last Processed
            </span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {payrollData.lastProcessed}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              Next Payroll
            </span>
          </div>
          <span className="font-medium text-primary-600 dark:text-primary-400">
            {payrollData.nextPayroll}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              Employees
            </span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {payrollData.employeeCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
          Process Next Payroll
        </button>
        <button className="w-full text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 py-2 px-4 rounded-lg font-medium transition-colors">
          View Detailed Report
        </button>
      </div>
    </div>
  )
}
