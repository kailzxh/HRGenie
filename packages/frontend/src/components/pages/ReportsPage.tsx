<<<<<<< HEAD
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Analytics Module Components
import WorkforceAnalytics from '@/components/reports/WorkforceAnalytics';
import RecruitmentAnalytics from '@/components/reports/RecruitmentAnalytics';
import AttendanceAnalytics from '@/components/reports/AttendanceAnalytics';
import PerformanceAnalytics from '@/components/reports/PerformanceAnalytics';
import PayrollAnalytics from '@/components/reports/PayrollAnalytics';
import AIPredictiveInsights from '@/components/reports/AIPredictiveInsights';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [department, setDepartment] = useState<string>('all');
  const [location, setLocation] = useState<string>('all');
  const [employeeStatus, setEmployeeStatus] = useState<string>('all');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">HR Command Center</p>
        </div>
      </div>

      {/* Global Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
            className="w-[300px]"
          />
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
            </SelectContent>
          </Select>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="hq">Headquarters</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="branch1">Branch 1</SelectItem>
            </SelectContent>
          </Select>
          <Select value={employeeStatus} onValueChange={setEmployeeStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Employee Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="onLeave">On Leave</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Analytics Modules */}
      <Card className="p-4">
        <Tabs defaultValue="workforce" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="workforce">Workforce</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <TabsContent value="workforce">
              <WorkforceAnalytics
                dateRange={dateRange}
                department={department}
                location={location}
                employeeStatus={employeeStatus}
              />
            </TabsContent>
            <TabsContent value="recruitment">
              <RecruitmentAnalytics
                dateRange={dateRange}
                department={department}
                location={location}
              />
            </TabsContent>
            <TabsContent value="attendance">
              <AttendanceAnalytics
                dateRange={dateRange}
                department={department}
                location={location}
                employeeStatus={employeeStatus}
              />
            </TabsContent>
            <TabsContent value="performance">
              <PerformanceAnalytics
                dateRange={dateRange}
                department={department}
                location={location}
                employeeStatus={employeeStatus}
              />
            </TabsContent>
            <TabsContent value="payroll">
              <PayrollAnalytics
                dateRange={dateRange}
                department={department}
                location={location}
                employeeStatus={employeeStatus}
              />
            </TabsContent>
            <TabsContent value="ai-insights">
              <AIPredictiveInsights
                dateRange={dateRange}
                department={department}
                location={location}
                employeeStatus={employeeStatus}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </Card>
    </div>
  );
}
=======
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Analytics Module Components
import WorkforceAnalytics from '@/components/reports/WorkforceAnalytics';
import RecruitmentAnalytics from '@/components/reports/RecruitmentAnalytics';
import AttendanceAnalytics from '@/components/reports/AttendanceAnalytics';
import PerformanceAnalytics from '@/components/reports/PerformanceAnalytics';
import PayrollAnalytics from '@/components/reports/PayrollAnalytics';
import AIPredictiveInsights from '@/components/reports/AIPredictiveInsights';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [department, setDepartment] = useState<string>('all');
  const [location, setLocation] = useState<string>('all');
  const [employeeStatus, setEmployeeStatus] = useState<string>('all');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">HR Command Center</p>
        </div>
      </div>

      {/* Global Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
            className="w-[300px]"
          />
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
            </SelectContent>
          </Select>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="hq">Headquarters</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="branch1">Branch 1</SelectItem>
            </SelectContent>
          </Select>
          <Select value={employeeStatus} onValueChange={setEmployeeStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Employee Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="onLeave">On Leave</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Analytics Modules */}
      <Card className="p-4">
        <Tabs defaultValue="workforce" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="workforce">Workforce</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <TabsContent value="workforce">
              <WorkforceAnalytics
                dateRange={dateRange}
                department={department}
                location={location}
                employeeStatus={employeeStatus}
              />
            </TabsContent>
            <TabsContent value="recruitment">
              <RecruitmentAnalytics
                dateRange={dateRange}
                department={department}
                location={location}
              />
            </TabsContent>
            <TabsContent value="attendance">
              <AttendanceAnalytics
                dateRange={dateRange}
                department={department}
                location={location}
                employeeStatus={employeeStatus}
              />
            </TabsContent>
            <TabsContent value="performance">
              <PerformanceAnalytics
                dateRange={dateRange}
                department={department}
                location={location}
                employeeStatus={employeeStatus}
              />
            </TabsContent>
            <TabsContent value="payroll">
              <PayrollAnalytics
                dateRange={dateRange}
                department={department}
                location={location}
                employeeStatus={employeeStatus}
              />
            </TabsContent>
            <TabsContent value="ai-insights">
              <AIPredictiveInsights
                dateRange={dateRange}
                department={department}
                location={location}
                employeeStatus={employeeStatus}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </Card>
    </div>
  );
}
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
