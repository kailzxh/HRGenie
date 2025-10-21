'use client';
export const dynamic = 'force-dynamic';
import { Card } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkforceAnalyticsProps {
  dateRange?: { from: Date; to: Date };
  department: string;
  location: string;
  employeeStatus: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function WorkforceAnalytics({
  dateRange,
  department,
  location,
  employeeStatus,
}: WorkforceAnalyticsProps) {
  // Sample data - In a real app, this would come from your API
  const headcountData = [
    { month: 'Jan', count: 150 },
    { month: 'Feb', count: 160 },
    { month: 'Mar', count: 165 },
    { month: 'Apr', count: 170 },
    { month: 'May', count: 180 },
    { month: 'Jun', count: 185 },
  ];

  const demographicsData = [
    { name: 'Engineering', value: 40 },
    { name: 'Sales', value: 25 },
    { name: 'Marketing', value: 20 },
    { name: 'HR', value: 15 },
  ];

  const metrics = [
    { label: 'Total Headcount', value: '185' },
    { label: 'New Hires (This Month)', value: '12' },
    { label: 'Exits (This Month)', value: '3' },
    { label: 'Attrition Rate', value: '1.6%' },
    { label: 'Average Tenure', value: '2.4 yrs' },
    { label: 'Diversity Ratio', value: '45:55' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</h3>
            <p className="text-2xl font-bold mt-2">{metric.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount Trend */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Headcount Trend</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={headcountData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Demographics */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Department Distribution</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographicsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent as any * 100).toFixed(0)}%`}
                >
                  {demographicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Downloadable Reports */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Master Employee Data
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            New Hires Report
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Employee Exit Report
          </Button>
        </div>
      </Card>
    </div>
  );
}