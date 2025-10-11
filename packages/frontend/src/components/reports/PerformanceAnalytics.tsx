<<<<<<< HEAD
'use client';

import { Card } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PerformanceAnalyticsProps {
  dateRange?: { from: Date; to: Date };
  department: string;
  location: string;
  employeeStatus: string;
}

export default function PerformanceAnalytics({
  dateRange,
  department,
  location,
  employeeStatus,
}: PerformanceAnalyticsProps) {
  // Sample data - In a real app, this would come from your API
  const metrics = [
    { label: 'Performance Rating Avg', value: '3.8/5' },
    { label: 'Goal Achievement Rate', value: '78%' },
    { label: 'Reviews Completed', value: '92%' },
    { label: 'High Performers', value: '15%' },
  ];

  const performanceDistribution = [
    { rating: '1 - Poor', count: 5 },
    { rating: '2 - Below Avg', count: 15 },
    { rating: '3 - Average', count: 45 },
    { rating: '4 - Good', count: 25 },
    { rating: '5 - Excellent', count: 10 },
  ];

  const ninebox = Array.from({ length: 20 }, (_, i) => ({
    potential: Math.random() * 5,
    performance: Math.random() * 5,
    name: `Employee ${i + 1}`,
  }));

  const goalProgress = [
    { month: 'Jan', progress: 65 },
    { month: 'Feb', progress: 70 },
    { month: 'Mar', progress: 75 },
    { month: 'Apr', progress: 72 },
    { month: 'May', progress: 78 },
    { month: 'Jun', progress: 82 },
  ];

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
        {/* Performance Bell Curve */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Performance Distribution</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceDistribution}>
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 9-Box Grid */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">High-Potential Matrix</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="performance" name="Performance" domain={[0, 5]} />
                <YAxis type="number" dataKey="potential" name="Potential" domain={[0, 5]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Employees" data={ninebox} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Goal Progress */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Goal Achievement Trends</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={goalProgress}>
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="progress" stroke="#0088FE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Downloadable Reports */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Review Status Report
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Competency Analysis
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Goals Progress Report
          </Button>
        </div>
      </Card>
    </div>
  );
=======
'use client';

import { Card } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PerformanceAnalyticsProps {
  dateRange?: { from: Date; to: Date };
  department: string;
  location: string;
  employeeStatus: string;
}

export default function PerformanceAnalytics({
  dateRange,
  department,
  location,
  employeeStatus,
}: PerformanceAnalyticsProps) {
  // Sample data - In a real app, this would come from your API
  const metrics = [
    { label: 'Performance Rating Avg', value: '3.8/5' },
    { label: 'Goal Achievement Rate', value: '78%' },
    { label: 'Reviews Completed', value: '92%' },
    { label: 'High Performers', value: '15%' },
  ];

  const performanceDistribution = [
    { rating: '1 - Poor', count: 5 },
    { rating: '2 - Below Avg', count: 15 },
    { rating: '3 - Average', count: 45 },
    { rating: '4 - Good', count: 25 },
    { rating: '5 - Excellent', count: 10 },
  ];

  const ninebox = Array.from({ length: 20 }, (_, i) => ({
    potential: Math.random() * 5,
    performance: Math.random() * 5,
    name: `Employee ${i + 1}`,
  }));

  const goalProgress = [
    { month: 'Jan', progress: 65 },
    { month: 'Feb', progress: 70 },
    { month: 'Mar', progress: 75 },
    { month: 'Apr', progress: 72 },
    { month: 'May', progress: 78 },
    { month: 'Jun', progress: 82 },
  ];

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
        {/* Performance Bell Curve */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Performance Distribution</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceDistribution}>
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 9-Box Grid */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">High-Potential Matrix</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="performance" name="Performance" domain={[0, 5]} />
                <YAxis type="number" dataKey="potential" name="Potential" domain={[0, 5]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Employees" data={ninebox} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Goal Progress */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Goal Achievement Trends</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={goalProgress}>
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="progress" stroke="#0088FE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Downloadable Reports */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Review Status Report
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Competency Analysis
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Goals Progress Report
          </Button>
        </div>
      </Card>
    </div>
  );
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
}