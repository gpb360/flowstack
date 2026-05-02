import React from 'react';
import { CardUntitled } from '@/components/ui';
import type { GeoMapWidgetConfig } from '../types';

interface GeoMapWidgetProps {
  title: string;
  data: Array<{
    country: string;
    region?: string;
    value: number;
    [key: string]: any;
  }>;
  config?: GeoMapWidgetConfig;
  className?: string;
}

// Simple country code to name mapping (in production, use a proper library)
const countryCodes: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  JP: 'Japan',
  AU: 'Australia',
  BR: 'Brazil',
  IN: 'India',
  CN: 'China',
  // Add more as needed
};

export function GeoMapWidget({
  title,
  data,
  config,
  className,
}: GeoMapWidgetProps) {
  const {
    mapType: _mapType = 'world',
    showLabels = true,
    interactive = true,
    colorScale: _colorScale = ['#e0f2fe', '#0284c7'],
  } = config || {};

  // Group data by country
  const countryData = React.useMemo(() => {
    const grouped = new Map<string, number>();

    data.forEach((item) => {
      const country = item.country;
      grouped.set(country, (grouped.get(country) || 0) + item.value);
    });

    return Array.from(grouped.entries()).map(([country, value]) => ({
      code: country,
      name: countryCodes[country] || country,
      value,
    }));
  }, [data]);

  // Calculate min/max for color scaling
  const { minValue, maxValue } = React.useMemo(() => {
    const values = countryData.map((d) => d.value);
    return {
      minValue: Math.min(...values, 0),
      maxValue: Math.max(...values),
    };
  }, [countryData]);

  // Get color for a value
  const getColor = (value: number) => {
    if (value === 0) return '#f1f5f9';
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    const intensity = Math.floor(normalizedValue * 255);
    return `rgb(${14 - Math.floor(normalizedValue * 14)}, ${165 - intensity}, ${233 - intensity})`;
  };

  // Sort by value for leaderboard
  const sortedCountries = React.useMemo(() => {
    return [...countryData].sort((a, b) => b.value - a.value);
  }, [countryData]);

  return (
    <CardUntitled title={title} className={className}>
      <div>
        <div className="flex gap-4">
          {/* Map placeholder */}
          <div className="flex-1 aspect-[2/1] bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Simple world map visualization */}
            <svg viewBox="0 0 1000 500" className="w-full h-full">
              {/* Background */}
              <rect width="1000" height="500" fill="#f8fafc" />

              {/* Simplified continent shapes (placeholder) */}
              <g opacity="0.3">
                {/* North America */}
                <path d="M50,100 L300,100 L350,250 L200,300 L50,200 Z" fill="#cbd5e1" />
                {/* South America */}
                <path d="M250,350 L400,350 L350,500 L250,450 Z" fill="#cbd5e1" />
                {/* Europe */}
                <path d="M450,100 L600,100 L600,200 L450,200 Z" fill="#cbd5e1" />
                {/* Africa */}
                <path d="M450,250 L600,250 L600,450 L450,400 Z" fill="#cbd5e1" />
                {/* Asia */}
                <path d="M650,50 L950,50 L950,300 L650,300 Z" fill="#cbd5e1" />
                {/* Australia */}
                <path d="M800,350 L950,350 L950,450 L800,450 Z" fill="#cbd5e1" />
              </g>

              {/* Data points */}
              {countryData.map((country) => {
                // Simplified coordinates for major countries (placeholder)
                const coords = getCountryCoordinates(country.code);
                if (!coords) return null;

                const color = getColor(country.value);
                const size = Math.max(5, Math.min(20, (country.value / maxValue) * 20));

                return (
                  <g key={country.code} className={interactive ? 'cursor-pointer' : ''}>
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={size}
                      fill={color}
                      opacity={0.7}
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                    {showLabels && size > 10 && (
                      <text
                        x={coords.x}
                        y={coords.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[8px] font-medium fill-white pointer-events-none"
                      >
                        {country.code}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Tooltip placeholder */}
            <div className="absolute bottom-2 right-2 bg-background border rounded px-2 py-1 text-xs">
              Map view (simplified)
            </div>
          </div>

          {/* Leaderboard */}
          <div className="w-64 space-y-2">
            {sortedCountries.slice(0, 10).map((country) => (
              <div key={country.code} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded flex-shrink-0"
                  style={{ backgroundColor: getColor(country.value) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{country.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {country.value.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardUntitled>
  );
}

// Simplified coordinates for major countries (placeholder)
function getCountryCoordinates(code: string): { x: number; y: number } | null {
  const coords: Record<string, { x: number; y: number }> = {
    US: { x: 200, y: 180 },
    CA: { x: 180, y: 120 },
    GB: { x: 480, y: 130 },
    DE: { x: 510, y: 140 },
    FR: { x: 490, y: 160 },
    ES: { x: 480, y: 190 },
    IT: { x: 520, y: 180 },
    JP: { x: 850, y: 180 },
    AU: { x: 850, y: 380 },
    BR: { x: 300, y: 380 },
    IN: { x: 700, y: 230 },
    CN: { x: 780, y: 170 },
  };

  return coords[code] || null;
}
