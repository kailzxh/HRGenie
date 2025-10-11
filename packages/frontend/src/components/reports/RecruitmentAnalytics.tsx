<<<<<<< HEAD
'use client';

import { Card } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, FunnelChart, Funnel, FunnelPlot, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecruitmentAnalyticsProps {
  dateRange?: { from: Date; to: Date };
  department: string;
  location: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function RecruitmentAnalytics({
  dateRange,
  department,
  location,
}: RecruitmentAnalyticsProps) {
  // Sample data - In a real app, this would come from your API
  const metrics = [
    { label: 'Average Time-to-Hire', value: '45 days' },
    { label: 'Cost-per-Hire', value: '$3,500' },
    { label: 'Offer Acceptance Rate', value: '85%' },
    { label: 'Source Effectiveness', value: '72%' },
  ];

  const funnelData = [
    { name: 'Applied', value: 1000 },
    { name: 'Screened', value: 400 },
    { name: 'Interviewed', value: 200 },
    { name: 'Hired', value: 50 },
  ];

  const sourceData = [
    { name: 'LinkedIn', value: 40 },
    { name: 'Referrals', value: 30 },
    { name: 'Job Portals', value: 20 },
    { name: 'Other', value: 10 },
  ];

  const openPositionsData = [
    { department: 'Engineering', open: 12, closed: 8 },
    { department: 'Sales', open: 8, closed: 5 },
    { department: 'Marketing', open: 4, closed: 3 },
    { department: 'HR', open: 2, closed: 1 },
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
        {/* Recruitment Funnel */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recruitment Funnel</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Source of Hire */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Source of Hire</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Open vs. Closed Positions */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Open vs. Closed Positions</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={openPositionsData}>
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="open" name="Open Positions" fill="#0088FE" />
              <Bar dataKey="closed" name="Closed Positions" fill="#00C49F" />
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
            Candidate Pipeline
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Recruiter Performance
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Job Opening Status
          </Button>
        </div>
      </Card>
    </div>
  );
=======
'use client';

import { Card } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, FunnelChart, Funnel, FunnelPlot, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecruitmentAnalyticsProps {
  dateRange?: { from: Date; to: Date };
  department: string;
  location: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function RecruitmentAnalytics({
  dateRange,
  department,
  location,
}: RecruitmentAnalyticsProps) {
  // Sample data - In a real app, this would come from your API
  const metrics = [
    { label: 'Average Time-to-Hire', value: '45 days' },
    { label: 'Cost-per-Hire', value: '$3,500' },
    { label: 'Offer Acceptance Rate', value: '85%' },
    { label: 'Source Effectiveness', value: '72%' },
  ];

  const funnelData = [
    { name: 'Applied', value: 1000 },
    { name: 'Screened', value: 400 },
    { name: 'Interviewed', value: 200 },
    { name: 'Hired', value: 50 },
  ];

  const sourceData = [
    { name: 'LinkedIn', value: 40 },
    { name: 'Referrals', value: 30 },
    { name: 'Job Portals', value: 20 },
    { name: 'Other', value: 10 },
  ];

  const openPositionsData = [
    { department: 'Engineering', open: 12, closed: 8 },
    { department: 'Sales', open: 8, closed: 5 },
    { department: 'Marketing', open: 4, closed: 3 },
    { department: 'HR', open: 2, closed: 1 },
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
        {/* Recruitment Funnel */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recruitment Funnel</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Source of Hire */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Source of Hire</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Open vs. Closed Positions */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Open vs. Closed Positions</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={openPositionsData}>
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="open" name="Open Positions" fill="#0088FE" />
              <Bar dataKey="closed" name="Closed Positions" fill="#00C49F" />
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
            Candidate Pipeline
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Recruiter Performance
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Job Opening Status
          </Button>
        </div>
      </Card>
    </div>
  );
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
}