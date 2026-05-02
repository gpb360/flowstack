import { CardUntitled } from '@/components/ui';
import type { GaugeWidgetConfig } from '../types';

interface GaugeWidgetProps {
  title: string;
  value: number;
  min: number;
  max: number;
  config?: GaugeWidgetConfig;
  className?: string;
}

export function GaugeWidget({
  title,
  value,
  min,
  max,
  config,
  className,
}: GaugeWidgetProps) {
  const {
    thresholds,
    showValue = true,
    colorScheme = 'blue',
  } = config || {};

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  // Determine color based on thresholds or scheme
  const getColor = () => {
    if (thresholds && thresholds.length > 0) {
      const threshold = thresholds.find((t) => value <= t.value);
      return threshold?.color || thresholds[thresholds.length - 1].color;
    }

    switch (colorScheme) {
      case 'green':
        return '#22c55e';
      case 'red':
        return '#ef4444';
      case 'orange':
        return '#f97316';
      case 'blue':
      default:
        return '#3b82f6';
    }
  };

  const color = getColor();

  // Create gauge SVG
  const createGauge = () => {
    const size = 200;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transform: 'rotate(180deg)',
            transformOrigin: `${center}px ${center}px`,
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
        {/* Value text */}
        {showValue && (
          <text
            x={center}
            y={center - 10}
            textAnchor="middle"
            className="text-3xl font-bold"
            fill="currentColor"
          >
            {value.toLocaleString()}
          </text>
        )}
        {/* Min/Max labels */}
        <text
          x={strokeWidth}
          y={center + 25}
          textAnchor="start"
          className="text-xs"
          fill="#6b7280"
        >
          {min.toLocaleString()}
        </text>
        <text
          x={size - strokeWidth}
          y={center + 25}
          textAnchor="end"
          className="text-xs"
          fill="#6b7280"
        >
          {max.toLocaleString()}
        </text>
      </svg>
    );
  };

  return (
    <CardUntitled title={title} className={className}>
      <div className="flex justify-center">
        {createGauge()}
      </div>
    </CardUntitled>
  );
}
