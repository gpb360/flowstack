import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { BarChart3, TrendingUp, Users, MessageCircle, Share2, Heart } from 'lucide-react';
import { useSocialAnalytics } from '../hooks/useMediaLibrary';

interface PostAnalyticsProps {
  postId: string;
}

export function PostAnalytics({ postId }: PostAnalyticsProps) {
  const { data: analytics, isLoading } = useSocialAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Impressions',
      value: analytics?.total_impressions || 0,
      icon: BarChart3,
      color: 'text-blue-500',
    },
    {
      label: 'Engagement',
      value: analytics?.total_engagement || 0,
      icon: TrendingUp,
      color: 'text-[#D4AF37]',
    },
    {
      label: 'Likes',
      value: analytics?.avg_likes || 0,
      icon: Heart,
      color: 'text-red-500',
    },
    {
      label: 'Comments',
      value: analytics?.total_comments || 0,
      icon: MessageCircle,
      color: 'text-purple-500',
    },
    {
      label: 'Shares',
      value: analytics?.total_shares || 0,
      icon: Share2,
      color: 'text-orange-500',
    },
    {
      label: 'Followers',
      value: analytics?.total_followers || 0,
      icon: Users,
      color: 'text-cyan-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className={cn('h-5 w-5', metric.color)} />
                  <div>
                    <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                    <div className="text-sm text-text-secondary">{metric.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {analytics?.avg_engagement_rate?.toFixed(2) || '0.00'}%
          </div>
          <p className="text-sm text-text-secondary mt-2">
            Average engagement rate across all posts
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
