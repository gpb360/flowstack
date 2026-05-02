/**
 * Sentiment Analysis Chart
 * Visualizes positive, neutral, and negative review sentiment
 */

import { cn } from '@/lib/utils';

export function SentimentAnalysis({ positive, neutral, negative }: {
  positive: number;
  neutral: number;
  negative: number;
}) {
  const total = positive + neutral + negative;
  const positivePct = total > 0 ? (positive / total) * 100 : 0;
  const neutralPct = total > 0 ? (neutral / total) * 100 : 0;
  const negativePct = total > 0 ? (negative / total) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="h-4 overflow-hidden rounded-full bg-gray-200">
        <div className="flex h-full">
          <div className="bg-green-500" style={{ width: `${positivePct}%` }} />
          <div className="bg-yellow-500" style={{ width: `${neutralPct}%` }} />
          <div className="bg-red-500" style={{ width: `${negativePct}%` }} />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span>Positive</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">{positive}</span>
            <span className="text-muted-foreground">{positivePct.toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-yellow-500" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">{neutral}</span>
            <span className="text-muted-foreground">{neutralPct.toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span>Negative</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">{negative}</span>
            <span className="text-muted-foreground">{negativePct.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
