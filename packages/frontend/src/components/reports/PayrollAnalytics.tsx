<<<<<<< HEAD
'use client';

import { Card } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, BoxPlot } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PayrollAnalyticsProps {
  dateRange?: { from: Date; to: Date };
  department: string;
  location: string;
  employeeStatus: string;
}

export default function PayrollAnalytics({
  dateRange,
  department,
  location,
  employeeStatus,
}: PayrollAnalyticsProps) {
  // Sample data - In a real app, this would come from your API
  const metrics = [
    { label: 'Total Payroll Cost', value: '$1.2M' },
    { label: 'Avg Cost/Employee', value: '$5,200' },
    { label: 'MoM Variance', value: '+2.3%' },
    { label: 'Benefits Cost', value: '$280K' },
  ];

  const payrollTrend = [
    { month: 'Jan', cost: 1150000 },
    { month: 'Feb', cost: 1180000 },
    { month: 'Mar', cost: 1160000 },
    { month: 'Apr', cost: 1190000 },
    { month: 'May', cost: 1210000 },
    { month: 'Jun', cost: 1200000 },
  ];

  const salaryDistribution = [
    { department: 'Engineering', min: 60000, q1: 75000, median: 90000, q3: 120000, max: 180000 },
    { department: 'Sales', min: 45000, q1: 55000, median: 70000, q3: 90000, max: 150000 },
    { department: 'Marketing', min: 50000, q1: 60000, median: 75000, q3: 95000, max: 140000 },
    { department: 'HR', min: 45000, q1: 52000, median: 65000, q3: 85000, max: 120000 },
  ];

  const bonusData = [
    { type: 'Performance Bonus', amount: 250000 },
    { type: 'Sales Commission', amount: 180000 },
    { type: 'Year-End Bonus', amount: 320000 },
    { type: 'Spot Awards', amount: 50000 },
  ];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6 p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</h3>
            <p className="text-2xl font-bold mt-2">{metric.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Cost Trend */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Payroll Cost Trend</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payrollTrend}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="cost" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Salary Distribution */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Salary Distribution by Department</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BoxPlot
                layout="vertical"
                data={salaryDistribution}
                dataKey="department"
                minDataKey="min"
                q1DataKey="q1"
                medianDataKey="median"
                q3DataKey="q3"
                maxDataKey="max"
                fill="#8884d8"
              />
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bonus Distribution */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Bonus & Incentive Distribution</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bonusData}>
              <XAxis dataKey="type" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="amount" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Downloadable Reports */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Salary Register
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Payroll Variance
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Statutory Compliance
          </Button>
        </div>
      </Card>
    </div>
  );
=======
'use client';

import { Card } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, BoxPlot } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PayrollAnalyticsProps {
  dateRange?: { from: Date; to: Date };
  department: string;
  location: string;
  employeeStatus: string;
}

export default function PayrollAnalytics({
  dateRange,
  department,
  location,
  employeeStatus,
}: PayrollAnalyticsProps) {
  // Sample data - In a real app, this would come from your API
  const metrics = [
    { label: 'Total Payroll Cost', value: '$1.2M' },
    { label: 'Avg Cost/Employee', value: '$5,200' },
    { label: 'MoM Variance', value: '+2.3%' },
    { label: 'Benefits Cost', value: '$280K' },
  ];

  const payrollTrend = [
    { month: 'Jan', cost: 1150000 },
    { month: 'Feb', cost: 1180000 },
    { month: 'Mar', cost: 1160000 },
    { month: 'Apr', cost: 1190000 },
    { month: 'May', cost: 1210000 },
    { month: 'Jun', cost: 1200000 },
  ];

  const salaryDistribution = [
    { department: 'Engineering', min: 60000, q1: 75000, median: 90000, q3: 120000, max: 180000 },
    { department: 'Sales', min: 45000, q1: 55000, median: 70000, q3: 90000, max: 150000 },
    { department: 'Marketing', min: 50000, q1: 60000, median: 75000, q3: 95000, max: 140000 },
    { department: 'HR', min: 45000, q1: 52000, median: 65000, q3: 85000, max: 120000 },
  ];

  const bonusData = [
    { type: 'Performance Bonus', amount: 250000 },
    { type: 'Sales Commission', amount: 180000 },
    { type: 'Year-End Bonus', amount: 320000 },
    { type: 'Spot Awards', amount: 50000 },
  ];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6 p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</h3>
            <p className="text-2xl font-bold mt-2">{metric.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Cost Trend */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Payroll Cost Trend</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payrollTrend}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="cost" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Salary Distribution */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Salary Distribution by Department</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BoxPlot
                layout="vertical"
                data={salaryDistribution}
                dataKey="department"
                minDataKey="min"
                q1DataKey="q1"
                medianDataKey="median"
                q3DataKey="q3"
                maxDataKey="max"
                fill="#8884d8"
              />
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bonus Distribution */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Bonus & Incentive Distribution</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bonusData}>
              <XAxis dataKey="type" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="amount" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Downloadable Reports */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Salary Register
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Payroll Variance
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Statutory Compliance
          </Button>
        </div>
      </Card>
    </div>
  );
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
}