<<<<<<< HEAD
import React from 'react';
import { cn } from '@/lib/utils';

interface HeatMapData {
  value: number;
  day: number;
  week: number;
}

interface HeatMapProps {
  data: HeatMapData[];
  xLabels: string[];
  yLabels: string[];
}

export function HeatMap({ data, xLabels, yLabels }: HeatMapProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  
  const getColorIntensity = (value: number) => {
    const intensity = value / maxValue;
    return `rgba(59, 130, 246, ${intensity})`; // Using blue color with varying opacity
  };

  return (
    <div className="relative">
      {/* Y-axis labels */}
      <div className="absolute -left-20 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
        {yLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="absolute -top-6 left-0 right-0 flex justify-between text-xs text-gray-500">
        {xLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      {/* Heat map grid */}
      <div className="grid grid-cols-7 gap-1">
        {data.map((item, i) => (
          <div
            key={i}
            className={cn(
              "h-4 rounded-sm",
              "hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
            )}
            style={{
              backgroundColor: getColorIntensity(item.value),
            }}
            title={`${xLabels[item.day]} - ${yLabels[item.week]}: ${item.value}`}
          />
        ))}
      </div>
    </div>
  );
=======
import React from 'react';
import { cn } from '@/lib/utils';

interface HeatMapData {
  value: number;
  day: number;
  week: number;
}

interface HeatMapProps {
  data: HeatMapData[];
  xLabels: string[];
  yLabels: string[];
}

export function HeatMap({ data, xLabels, yLabels }: HeatMapProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  
  const getColorIntensity = (value: number) => {
    const intensity = value / maxValue;
    return `rgba(59, 130, 246, ${intensity})`; // Using blue color with varying opacity
  };

  return (
    <div className="relative">
      {/* Y-axis labels */}
      <div className="absolute -left-20 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
        {yLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="absolute -top-6 left-0 right-0 flex justify-between text-xs text-gray-500">
        {xLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      {/* Heat map grid */}
      <div className="grid grid-cols-7 gap-1">
        {data.map((item, i) => (
          <div
            key={i}
            className={cn(
              "h-4 rounded-sm",
              "hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
            )}
            style={{
              backgroundColor: getColorIntensity(item.value),
            }}
            title={`${xLabels[item.day]} - ${yLabels[item.week]}: ${item.value}`}
          />
        ))}
      </div>
    </div>
  );
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
}