import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Search } from 'lucide-react';

// ============================================================================
// SEO PREVIEW - Google search result preview
// ============================================================================

interface SEOPreviewProps {
  title?: string;
  description?: string;
  url?: string;
  onChange?: (field: 'title' | 'description', value: string) => void;
  editable?: boolean;
}

export const SEOPreview: React.FC<SEOPreviewProps> = ({
  title = '',
  description = '',
  url = '',
  onChange,
  editable = false,
}) => {
  const displayUrl = url || 'https://example.com/page';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search size={18} />
          Google Search Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
          <p className="text-xs text-gray-500">Google Search Result</p>

          {/* Title */}
          <div className="text-xl text-blue-800 line-clamp-1">
            {title || 'Your Page Title Here | Example Site'}
          </div>

          {/* URL */}
          <p className="text-sm text-green-700 line-clamp-1">{displayUrl}</p>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {description ||
              'A compelling description of your page will appear here. Write a meta description that entices users to click.'}
          </p>
        </div>

        {/* Character Counters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-500">Title Length</Label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-colors ${
                    title.length > 60 ? 'bg-red-500' : title.length > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((title.length / 60) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium">{title.length}/60</span>
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Description Length</Label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-colors ${
                    description.length > 160
                      ? 'bg-red-500'
                      : description.length > 150
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((description.length / 160) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium">{description.length}/160</span>
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        {editable && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="seo-title">SEO Title</Label>
              <Input
                id="seo-title"
                value={title}
                onChange={(e) => onChange?.('title', e.target.value)}
                placeholder="Your page title"
                maxLength={60}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-description">Meta Description</Label>
              <Textarea
                id="seo-description"
                value={description}
                onChange={(e) => onChange?.('description', e.target.value)}
                placeholder="A brief description of your page"
                rows={3}
                maxLength={160}
              />
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-gray-500 space-y-1 bg-blue-50 p-3 rounded">
          <p className="font-medium text-blue-900">SEO Tips:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Keep titles under 60 characters</li>
            <li>Keep descriptions under 160 characters</li>
            <li>Include relevant keywords naturally</li>
            <li>Make it compelling to increase click-through rate</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
