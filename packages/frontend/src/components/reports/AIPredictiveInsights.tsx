<<<<<<< HEAD
'use client';

import { Card } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Brain, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AIPredictiveInsightsProps {
  dateRange?: { from: Date; to: Date };
  department: string;
  location: string;
  employeeStatus: string;
}

export default function AIPredictiveInsights({
  dateRange,
  department,
  location,
  employeeStatus,
}: AIPredictiveInsightsProps) {
  const insights = [
    {
      type: 'attrition',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      title: 'Attrition Risk Alert',
      prediction: '15% attrition risk in Sales department',
      factors: ['Below-market salaries', 'High travel frequency', 'Work-life balance concerns'],
      recommendation: 'Review the compensation for Sales roles and consider implementing a wellness program.',
      confidence: 85,
    },
    {
      type: 'recruitment',
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      title: 'Recruitment Forecast',
      prediction: 'Need to source 280 candidates for Q1 engineering hiring',
      factors: ['Current funnel conversion rate: 7.1%', 'Time-to-hire: 45 days', 'Market competition high'],
      recommendation: 'Increase sourcing from Employee Referrals, which has a 25% higher conversion-to-hire rate.',
      confidence: 92,
    },
    {
      type: 'burnout',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      title: 'Burnout Detection',
      prediction: 'Increased burnout risk in Product team',
      factors: ['Spike in sick leaves', 'Increased weekend work', 'Delayed project deadlines'],
      recommendation: 'Encourage managers to discuss workload and promote taking time off.',
      confidence: 78,
    },
    {
      type: 'performance',
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      title: 'Performance Trend',
      prediction: 'Potential performance decline in Engineering',
      factors: ['Decreased code commit frequency', 'Increased project delays', 'Lower engagement scores'],
      recommendation: 'Schedule skip-level meetings and review team capacity planning.',
      confidence: 82,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${insight.bgColor}`}>
                <insight.icon className={`w-6 h-6 ${insight.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{insight.title}</h3>
                  <span className="text-sm text-gray-500">
                    Confidence: {insight.confidence}%
                  </span>
                </div>
                <Progress value={insight.confidence} className="mb-4" />
                <p className="text-lg font-medium mb-4">{insight.prediction}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Contributing Factors:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {insight.factors.map((factor, i) => (
                      <li key={i} className="text-gray-600 dark:text-gray-400">{factor}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500">AI Recommendation:</h4>
                  <p className="text-gray-600 dark:text-gray-400">{insight.recommendation}</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="default">Take Action</Button>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
=======
'use client';

import { Card } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Brain, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AIPredictiveInsightsProps {
  dateRange?: { from: Date; to: Date };
  department: string;
  location: string;
  employeeStatus: string;
}

export default function AIPredictiveInsights({
  dateRange,
  department,
  location,
  employeeStatus,
}: AIPredictiveInsightsProps) {
  const insights = [
    {
      type: 'attrition',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      title: 'Attrition Risk Alert',
      prediction: '15% attrition risk in Sales department',
      factors: ['Below-market salaries', 'High travel frequency', 'Work-life balance concerns'],
      recommendation: 'Review the compensation for Sales roles and consider implementing a wellness program.',
      confidence: 85,
    },
    {
      type: 'recruitment',
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      title: 'Recruitment Forecast',
      prediction: 'Need to source 280 candidates for Q1 engineering hiring',
      factors: ['Current funnel conversion rate: 7.1%', 'Time-to-hire: 45 days', 'Market competition high'],
      recommendation: 'Increase sourcing from Employee Referrals, which has a 25% higher conversion-to-hire rate.',
      confidence: 92,
    },
    {
      type: 'burnout',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      title: 'Burnout Detection',
      prediction: 'Increased burnout risk in Product team',
      factors: ['Spike in sick leaves', 'Increased weekend work', 'Delayed project deadlines'],
      recommendation: 'Encourage managers to discuss workload and promote taking time off.',
      confidence: 78,
    },
    {
      type: 'performance',
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      title: 'Performance Trend',
      prediction: 'Potential performance decline in Engineering',
      factors: ['Decreased code commit frequency', 'Increased project delays', 'Lower engagement scores'],
      recommendation: 'Schedule skip-level meetings and review team capacity planning.',
      confidence: 82,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${insight.bgColor}`}>
                <insight.icon className={`w-6 h-6 ${insight.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{insight.title}</h3>
                  <span className="text-sm text-gray-500">
                    Confidence: {insight.confidence}%
                  </span>
                </div>
                <Progress value={insight.confidence} className="mb-4" />
                <p className="text-lg font-medium mb-4">{insight.prediction}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Contributing Factors:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {insight.factors.map((factor, i) => (
                      <li key={i} className="text-gray-600 dark:text-gray-400">{factor}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500">AI Recommendation:</h4>
                  <p className="text-gray-600 dark:text-gray-400">{insight.recommendation}</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="default">Take Action</Button>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
}