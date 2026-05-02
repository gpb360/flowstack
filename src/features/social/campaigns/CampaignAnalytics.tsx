import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { TrendingUp, Users, MessageCircle, Share2, Heart, Eye } from 'lucide-react';

interface CampaignAnalyticsProps {
  campaignId: string;
}

export function CampaignAnalytics({ campaignId }: CampaignAnalyticsProps) {
  // Mock data - replace with actual data from hooks
  const metrics = {
    totalPosts: 24,
    publishedPosts: 18,
    scheduledPosts: 6,
    totalImpressions: 125000,
    totalEngagement: 8500,
    engagementRate: 6.8,
    totalLikes: 5200,
    totalComments: 2100,
    totalShares: 1200,
  };

  const platformBreakdown = [
    { platform: 'Facebook', impressions: 45000, engagement: 3200 },
    { platform: 'Instagram', impressions: 38000, engagement: 2800 },
    { platform: 'Twitter', impressions: 25000, engagement: 1500 },
    { platform: 'LinkedIn', impressions: 17000, engagement: 1000 },
  ];

  const topPosts = [
    {
      id: '1',
      content: 'Check out our new summer collection! 🌞 #Summer2024',
      platform: 'Instagram',
      impressions: 12000,
      engagement: 850,
      engagementRate: 7.1,
    },
    {
      id: '2',
      content: 'Flash sale! 50% off everything for the next 24 hours only!',
      platform: 'Facebook',
      impressions: 9800,
      engagement: 720,
      engagementRate: 7.3,
    },
    {
      id: '3',
      content: 'New product alert! Introducing our latest innovation',
      platform: 'LinkedIn',
      impressions: 8500,
      engagement: 620,
      engagementRate: 7.3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</div>
                <div className="text-sm text-text-secondary">Impressions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
              <div>
                <div className="text-2xl font-bold">{metrics.engagementRate}%</div>
                <div className="text-sm text-text-secondary">Engagement Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{metrics.totalEngagement.toLocaleString()}</div>
                <div className="text-sm text-text-secondary">Total Engagement</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{metrics.totalLikes.toLocaleString()}</div>
                <div className="text-sm text-text-secondary">Total Likes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformBreakdown.map((platform) => (
              <div key={platform.platform}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{platform.platform}</span>
                  <span className="text-sm text-text-secondary">
                    {platform.impressions.toLocaleString()} impressions
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(platform.engagement / platform.impressions) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPosts.map((post) => (
              <div key={post.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="text-xs text-text-secondary mt-1">{post.platform}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{post.engagementRate}%</div>
                    <div className="text-xs text-text-secondary">engagement</div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="font-medium">{post.impressions.toLocaleString()}</span>
                    <span className="text-text-secondary ml-1">impressions</span>
                  </div>
                  <div>
                    <span className="font-medium">{post.engagement.toLocaleString()}</span>
                    <span className="text-text-secondary ml-1">engagement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
