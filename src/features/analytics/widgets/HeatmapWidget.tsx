import React from 'react';
import { CardUntitled } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { HeatmapWidgetConfig } from '../types';

interface HeatmapWidgetProps {
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  valueAxis: string;
  config?: HeatmapWidgetConfig;
  className?: string;
}

export function HeatmapWidget({
  title,
  data,
  xAxis,
  yAxis,
  valueAxis,
  config,
  className,
}: HeatmapWidgetProps) {
  const {
    showLabels = true,
    colorScale: _colorScale = 'sequential',
    colorScheme = ['#e0f2fe', '#0284c7'],
  } = config || {};

  // Get unique X and Y axis values
  const xValues = React.useMemo(() => {
    return [...new Set(data.map((d) => d[xAxis]))];
  }, [data, xAxis]);

  const yValues = React.useMemo(() => {
    return [...new Set(data.map((d) => d[yAxis]))];
  }, [data, yAxis]);

  // Find min and max values for color scaling
  const { minValue, maxValue } = React.useMemo(() => {
    const values = data.map((d) => d[valueAxis]);
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }, [data, valueAxis]);

  // Get color for a value
  const getColor = (value: number) => {
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    const colorIndex = Math.floor(normalizedValue * (colorScheme.length - 1));
    return colorScheme[Math.min(colorIndex, colorScheme.length - 1)];
  };

  // Get cell value
  const getCellValue = (x: string, y: string) => {
    return data.find((d) => d[xAxis] === x && d[yAxis] === y)?.[valueAxis] || 0;
  };

  return (
    <CardUntitled title={title} className={className}>
      <div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex gap-1">
              {/* Header row */}
              <div className="w-24 flex-shrink-0" />
              {xValues.map((x) => (
                <div
                  key={x}
                  className="h-8 min-w-[60px] flex-shrink-0 flex items-center justify-center text-xs font-medium"
                >
                  {String(x)}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {yValues.map((y) => (
              <div key={y} className="flex gap-1 mt-1">
                <div className="w-24 min-w-[60px] flex-shrink-0 flex items-center text-xs font-medium">
                  {String(y)}
                </div>
                {xValues.map((x) => {
                  const value = getCellValue(x, y);
                  const color = getColor(value);

                  return (
                    <div
                      key={`${x}-${y}`}
                      className="h-12 min-w-[60px] flex-shrink-0 rounded flex items-center justify-center text-xs font-medium relative group"
                      style={{ backgroundColor: color }}
                    >
                      {showLabels && (
                        <span
                          className={cn(
                            'text-xs',
                            value > maxValue / 2 ? 'text-white' : 'text-gray-900'
                          )}
                        >
                          {value}
                        </span>
                      )}
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {`${yAxis}: ${y}, ${xAxis}: ${x}, ${valueAxis}: ${value}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Color scale legend */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Low</span>
              <div className="flex-1 h-3 rounded" style={{
                background: `linear-gradient(to right, ${colorScheme.join(', ')})`
              }} />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>
      </div>
    </CardUntitled>
  );
}
