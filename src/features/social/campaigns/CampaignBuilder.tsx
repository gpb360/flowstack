import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button-untitled';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { Input } from '@/components/ui/input-untitled';
import { Textarea } from '@/components/ui/textarea-untitled';
import { Badge } from '@/components/ui/badge-untitled';
import { Plus, Calendar, TrendingUp } from 'lucide-react';

interface CampaignBuilderProps {
  campaignId?: string;
}

export function CampaignBuilder({ campaignId }: CampaignBuilderProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={campaignId ? 'Edit Campaign' : 'New Campaign'}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              Save Draft
            </Button>
            <Button>
              {campaignId ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Campaign Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Summer Sale 2024"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your campaign goals and strategy"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Goals & Objectives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a goal (e.g., Increase followers by 20%)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <Button onClick={handleAddGoal}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {goals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {goal}
                      <button
                        onClick={() => handleRemoveGoal(index)}
                        className="ml-2 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Date</label>
                  <Input type="date" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-text-secondary">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-text-secondary">Scheduled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-text-secondary">Published</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Posts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Linked Posts</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-text-secondary">
                No posts linked to this campaign yet
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
