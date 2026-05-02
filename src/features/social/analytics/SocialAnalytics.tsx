import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { TrendingUp, Users, BarChart3, Calendar } from 'lucide-react';
import { useSocialAnalytics } from '../hooks/useMediaLibrary';

export function SocialAnalytics() {
  const { data: analytics, isLoading } = useSocialAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Followers',
      value: analytics?.total_followers || 0,
      change: '+12.5%',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Engagement Rate',
      value: `${analytics?.avg_engagement_rate?.toFixed(2) || 0}%`,
      change: '+3.2%',
      icon: TrendingUp,
      color: 'text-[#D4AF37]',
    },
    {
      title: 'Posts This Month',
      value: analytics?.total_posts || 0,
      change: '+5',
      icon: Calendar,
      color: 'text-purple-500',
    },
    {
      title: 'Avg. Likes',
      value: analytics?.avg_likes || 0,
      change: '+15%',
      icon: BarChart3,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Social Analytics"
        description="Track your social media performance"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Overview Metrics */}
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-text-secondary">{metric.title}</div>
                      <div className="text-2xl font-bold mt-1">{metric.value}</div>
                      <div className="text-xs text-green-500 mt-1">{metric.change}</div>
                    </div>
                    <Icon className={cn('h-8 w-8', metric.color)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-text-secondary">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Engagement chart will appear here</p>
                <p className="text-sm">(Requires chart library integration)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { platform: 'Instagram', engagement: 35, color: 'bg-pink-500' },
                  { platform: 'Facebook', engagement: 28, color: 'bg-blue-500' },
                  { platform: 'Twitter', engagement: 22, color: 'bg-sky-500' },
                  { platform: 'LinkedIn', engagement: 15, color: 'bg-blue-700' },
                ].map((platform) => (
                  <div key={platform.platform}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{platform.platform}</span>
                      <span className="text-sm text-text-secondary">{platform.engagement}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn('h-2 rounded-full', platform.color)}
                        style={{ width: `${platform.engagement}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { content: 'Summer collection reveal! 🌞', engagement: '12.5%' },
                  { content: 'Flash sale - 50% off everything!', engagement: '10.2%' },
                  { content: 'Behind the scenes at our studio', engagement: '9.8%' },
                  { content: 'Customer spotlight: Sarah\'s story', engagement: '8.5%' },
                ].map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <p className="text-sm flex-1 line-clamp-1">{post.content}</p>
                    <span className="text-sm font-medium ml-2">{post.engagement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
