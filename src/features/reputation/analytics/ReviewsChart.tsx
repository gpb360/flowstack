/**
 * Reviews Trend Chart
 * Visualizes review volume and rating trends over time
 */

export function ReviewsChart({ data }: { data: Array<{ date: string; count: number; avg_rating: number }> }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-muted-foreground">No data available</div>;
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.count / maxCount) * 80; // Scale to 80% height
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-4">
      <div className="h-48">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}

          {/* Area under line */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="rgba(59, 130, 246, 0.1)"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d.count / maxCount) * 80;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill="#3b82f6"
              />
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.date}</span>
        <span>{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
