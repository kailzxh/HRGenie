'use client';

import { Card } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeatMap } from '@/components/ui/heat-map';

interface AttendanceAnalyticsProps {
  dateRange?: { from: Date; to: Date };
  department: string;
  location: string;
  employeeStatus: string;
}

export default function AttendanceAnalytics({
  dateRange,
  department,
  location,
  employeeStatus,
}: AttendanceAnalyticsProps) {
  // Sample data - In a real app, this would come from your API
  const metrics = [
    { label: 'Absenteeism Rate', value: '3.2%' },
    { label: 'Avg Overtime Hours', value: '4.5 hrs' },
    { label: 'Most Used Leave', value: 'Sick Leave' },
    { label: 'On Leave Today', value: '12' },
  ];

  const absenteeismData = [
    { month: 'Jan', rate: 3.5 },
    { month: 'Feb', rate: 3.2 },
    { month: 'Mar', rate: 3.8 },
    { month: 'Apr', rate: 3.1 },
    { month: 'May', rate: 3.4 },
    { month: 'Jun', rate: 3.2 },
  ];

  const leaveData = [
    { type: 'Sick Leave', available: 10, taken: 5 },
    { type: 'Vacation', available: 15, taken: 8 },
    { type: 'Personal', available: 5, taken: 2 },
    { type: 'Other', available: 3, taken: 1 },
  ];

  // Sample late coming heatmap data
  const heatmapData = Array.from({ length: 24 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => ({
      value: Math.floor(Math.random() * 10),
      day,
      week,
    }))
  ).flat();

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
        {/* Absenteeism Trends */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Absenteeism Trends</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={absenteeismData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Leave Consumption */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Leave Consumption</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveData}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="available" name="Available" fill="#0088FE" />
                <Bar dataKey="taken" name="Taken" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Late Coming Heatmap */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Late Coming Patterns</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="h-[200px]">
          <HeatMap
            data={heatmapData}
            xLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            yLabels={Array.from({ length: 24 }, (_, i) => `Week ${i + 1}`)}
          />
        </div>
      </Card>

      {/* Downloadable Reports */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Monthly Attendance
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Overtime Report
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Leave Balance Summary
          </Button>
        </div>
      </Card>
    </div>
  );
}