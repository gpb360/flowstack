import React from 'react';
import { CardUntitled } from '@/components/ui';
import type { CohortWidgetConfig } from '../types';

interface CohortWidgetProps {
  title: string;
  data: Array<{
    cohort: string;
    period: number;
    users: number;
    active: number;
  }>;
  config?: CohortWidgetConfig;
  className?: string;
}

export function CohortWidget({
  title,
  data,
  config,
  className,
}: CohortWidgetProps) {
  const {
    showPercentage = true,
    colorScale = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'],
  } = config || {};

  // Organize data by cohort
  const cohorts = React.useMemo(() => {
    const cohortMap = new Map<string, Map<number, number>>();

    data.forEach((item) => {
      if (!cohortMap.has(item.cohort)) {
        cohortMap.set(item.cohort, new Map());
      }

      const retentionRate = (item.active / item.users) * 100;
      cohortMap.get(item.cohort)!.set(item.period, retentionRate);
    });

    return Array.from(cohortMap.entries()).map(([cohort, periods]) => ({
      name: cohort,
      periods: Array.from(periods.entries()).map(([period, rate]) => ({
        period,
        rate,
      })),
      maxSize: periods.get(0) || 0, // Initial cohort size
    })).sort((a, b) => b.name.localeCompare(a.name));
  }, [data]);

  // Get color based on retention rate
  const getColor = (rate: number) => {
    const index = Math.floor((1 - rate / 100) * (colorScale.length - 1));
    return colorScale[Math.max(0, Math.min(index, colorScale.length - 1))];
  };

  const maxPeriod = Math.max(...cohorts.flatMap((c) => c.periods.map((p) => p.period)));

  return (
    <CardUntitled title={title} className={className}>
      <div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-xs font-medium">Cohort</th>
                  <th className="text-center p-2 text-xs font-medium">Size</th>
                  {Array.from({ length: maxPeriod }, (_, i) => (
                    <th key={i} className="text-center p-2 text-xs font-medium">
                      P{i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.name} className="border-b">
                    <td className="p-2 text-xs font-medium">{cohort.name}</td>
                    <td className="p-2 text-xs text-center text-muted-foreground">
                      {cohort.maxSize}
                    </td>
                    {Array.from({ length: maxPeriod }, (_, i) => {
                      const periodData = cohort.periods.find((p) => p.period === i);
                      const rate = periodData?.rate || 0;

                      return (
                        <td key={i} className="p-1">
                          <div
                            className="h-8 rounded flex items-center justify-center text-xs font-medium relative group"
                            style={{ backgroundColor: getColor(rate) }}
                          >
                            {showPercentage ? (
                              <span className={rate > 50 ? 'text-white' : 'text-gray-900'}>
                                {rate > 0 ? `${rate.toFixed(0)}%` : '-'}
                              </span>
                            ) : (
                              <span className={rate > 50 ? 'text-white' : 'text-gray-900'}>
                                {rate > 0 ? Math.round((rate / 100) * cohort.maxSize) : '-'}
                              </span>
                            )}
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              {`Period ${i}: ${rate.toFixed(1)}% retention`}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">High retention</span>
          <div className="flex-1 h-3 rounded" style={{
            background: `linear-gradient(to right, ${colorScale.reverse().join(', ')})`
          }} />
          <span className="text-xs text-muted-foreground">Low retention</span>
        </div>
      </div>
    </CardUntitled>
  );
}
