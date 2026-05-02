import React, { useState, useEffect } from 'react';
import { CardUntitled, BadgeUntitled } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { RealtimeWidgetConfig } from '../types';

interface RealtimeWidgetProps {
  title: string;
  value: number;
  previousValue?: number;
  config?: RealtimeWidgetConfig;
  onUpdate?: (value: number) => void;
  className?: string;
}

export function RealtimeWidget({
  title,
  value,
  previousValue,
  config,
  onUpdate,
  className,
}: RealtimeWidgetProps) {
  const {
    updateInterval = 5000,
    showHistory = true,
    historyLength = 20,
    alertThresholds = [],
  } = config || {};

  const [currentValue, setCurrentValue] = useState(value);
  const [history, setHistory] = useState<number[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isActive, setIsActive] = useState(false);

  // Update value
  useEffect(() => {
    setCurrentValue(value);
    setLastUpdate(new Date());

    if (showHistory) {
      setHistory((prev) => {
        const newHistory = [...prev, value];
        return newHistory.slice(-historyLength);
      });
    }
  }, [value, showHistory, historyLength]);

  // Simulate real-time updates (in production, this would be a WebSocket or subscription)
  useEffect(() => {
    if (!onUpdate) return;

    setIsActive(true);
    const interval = setInterval(() => {
      // Simulate small random changes
      const change = (Math.random() - 0.5) * (currentValue * 0.1);
      const newValue = Math.max(0, currentValue + change);
      onUpdate(newValue);
    }, updateInterval);

    return () => {
      clearInterval(interval);
      setIsActive(false);
    };
  }, [currentValue, updateInterval, onUpdate]);

  // Calculate change
  const change = React.useMemo(() => {
    if (previousValue === undefined) return null;
    return {
      value: currentValue - previousValue,
      percentage: previousValue > 0
        ? ((currentValue - previousValue) / previousValue) * 100
        : 0,
    };
  }, [currentValue, previousValue]);

  // Check for alerts
  const activeAlert = React.useMemo(() => {
    return alertThresholds.find((threshold) => {
      switch (threshold.condition) {
        case 'gt':
          return currentValue > threshold.value;
        case 'lt':
          return currentValue < threshold.value;
        case 'eq':
          return currentValue === threshold.value;
        default:
          return false;
      }
    });
  }, [currentValue, alertThresholds]);

  // Min/max for sparkline
  const minHistory = Math.min(...history, currentValue);
  const maxHistory = Math.max(...history, currentValue);
  const range = maxHistory - minHistory || 1;

  return (
    <CardUntitled
      title={title}
      className={cn(
        className,
        activeAlert && {
          'border-red-500 dark:border-red-500':
            activeAlert.severity === 'error',
          'border-orange-500 dark:border-orange-500':
            activeAlert.severity === 'warning',
          'border-blue-500 dark:border-blue-500':
            activeAlert.severity === 'info',
        }
      )}
      header={
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            )}
          />
          {isActive && (
            <BadgeUntitled variant="success" size="sm">Live</BadgeUntitled>
          )}
        </div>
      }
    >
      <div>
        <div className="space-y-3">
          {/* Current value */}
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold">
              {currentValue.toLocaleString()}
            </div>
            {change && (
              <div
                className={cn(
                  'text-sm font-medium',
                  change.value > 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {change.value > 0 ? '+' : ''}
                {change.value.toFixed(1)} ({change.percentage.toFixed(1)}%)
              </div>
            )}
          </div>

          {/* Alert message */}
          {activeAlert && (
            <div
              className={cn(
                'text-xs p-2 rounded',
                activeAlert.severity === 'error' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                activeAlert.severity === 'warning' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                activeAlert.severity === 'info' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              )}
            >
              {activeAlert.message}
            </div>
          )}

          {/* Sparkline */}
          {showHistory && history.length > 1 && (
            <div className="h-12 flex items-end gap-0.5">
              {history.map((val, index) => {
                const normalizedHeight = ((val - minHistory) / range) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500 rounded-t transition-all"
                    style={{ height: `${normalizedHeight}%`, minHeight: '2px' }}
                  />
                );
              })}
            </div>
          )}

          {/* Last update */}
          <div className="text-xs text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </CardUntitled>
  );
}
