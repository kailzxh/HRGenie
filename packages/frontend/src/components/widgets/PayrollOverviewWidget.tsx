'use client'

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, Users } from 'lucide-react';
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'

interface PayrollOverviewWidgetProps {
  payrollRuns?: Array<{
    id: string;
    status: string;
    total_gross: number;
    total_net: number;
    employee_count: number;
    created_at: string;
  }>;
}

export default function PayrollOverviewWidget({ payrollRuns }: PayrollOverviewWidgetProps) {
  const [payrollData, setPayrollData] = useState({
    totalPayroll: 0,
    employeeCount: 0,
    averageSalary: 0,
    lastProcessed: '',
    nextPayroll: '',
  });
  const [breakdown, setBreakdown] = useState<Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>>([]);
  // const [breakdown, setBreakdown] = useState([]) // Removed duplicate declaration

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        // If payrollRuns provided, use them, otherwise fetch from database
        let runs = payrollRuns;
        if (!runs || runs.length === 0) {
          const { data: payrollRunsData, error } = await supabase
            .from('payroll_runs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (payrollRunsData) runs = payrollRunsData;
        }

        if (runs && runs.length > 0) {
          const completedRuns = runs.filter(run => run.status === 'completed');
          const totalPayroll = completedRuns.reduce((sum, run) => sum + (run.total_gross || 0), 0);
          const latestRun = completedRuns[0] || runs[0];
          
          setPayrollData({
            totalPayroll: totalPayroll || 0,
            employeeCount: latestRun?.employee_count || 0,
            averageSalary: latestRun && latestRun.employee_count > 0 ? 
              Math.round((latestRun.total_gross || 0) / latestRun.employee_count) : 0,
            lastProcessed: latestRun?.created_at ? new Date(latestRun.created_at).toLocaleDateString() : 'Never',
            nextPayroll: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()
          });
        }

        // Fetch payroll breakdown from payroll_lines
        const { data: payrollLines, error: linesError } = await supabase
          .from('payroll_lines')
          .select('base_salary, allowances, bonus, overtime')
          .limit(100); // Get recent payroll lines

        if (payrollLines && payrollLines.length > 0) {
          const totalBase = payrollLines.reduce((sum, line) => sum + (line.base_salary || 0), 0);
          const totalAllowances = payrollLines.reduce((sum, line) => sum + (line.allowances || 0), 0);
          const totalBonus = payrollLines.reduce((sum, line) => sum + (line.bonus || 0), 0);
          const totalGross = totalBase + totalAllowances + totalBonus;
          
          if (totalGross > 0) {
            setBreakdown([
              { 
                category: 'Basic Salary', 
                amount: totalBase, 
                percentage: Math.round((totalBase / totalGross) * 100), 
                color: 'bg-blue-500' 
              },
              { 
                category: 'Allowances', 
                amount: totalAllowances, 
                percentage: Math.round((totalAllowances / totalGross) * 100), 
                color: 'bg-green-500' 
              },
              { 
                category: 'Bonuses', 
                amount: totalBonus, 
                percentage: Math.round((totalBonus / totalGross) * 100), 
                color: 'bg-purple-500' 
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching payroll data:', error);
      }
    };

    fetchPayrollData();
  }, [payrollRuns]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const currentStatus = payrollRuns && payrollRuns.length > 0 ? payrollRuns[0].status : 'completed';

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Payroll Overview
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            currentStatus === 'completed' ? 'bg-green-500' : 
            currentStatus === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-500 capitalize">
            {currentStatus}
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
              <span className="text-white text-lg font-bold">₹</span>
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

      
    </div>
  )
}
