import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Facebook, Twitter } from 'lucide-react';

// ============================================================================
// SOCIAL PREVIEW - Social media card preview
// ============================================================================

interface SocialPreviewProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  onChange?: (field: 'title' | 'description' | 'image', value: string) => void;
  editable?: boolean;
}

export const SocialPreview: React.FC<SocialPreviewProps> = ({
  title = '',
  description = '',
  image = '',
  url = '',
  onChange,
  editable = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Social Media Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Facebook Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Facebook size={18} className="text-blue-600" />
            Facebook / LinkedIn
          </div>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              {image ? (
                <img src={image} alt="OG Preview" className="w-full h-full object-cover" />
              ) : (
                <p className="text-gray-500 text-sm">OG Image Preview</p>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-500 uppercase">{url || 'https://example.com'}</p>
              <p className="font-semibold text-sm mt-1 line-clamp-2">
                {title || 'Your Page Title'}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {description || 'Your page description will appear here...'}
              </p>
            </div>
          </div>
        </div>

        {/* Twitter Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Twitter size={18} className="text-blue-400" />
            Twitter / X
          </div>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              {image ? (
                <img src={image} alt="OG Preview" className="w-full h-full object-cover" />
              ) : (
                <p className="text-gray-500 text-sm">OG Image Preview</p>
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm mt-1 line-clamp-2">
                {title || 'Your Page Title'}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {description || 'Your page description will appear here...'}
              </p>
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        {editable && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="og-title">OG Title</Label>
              <Input
                id="og-title"
                value={title}
                onChange={(e) => onChange?.('title', e.target.value)}
                placeholder="Your page title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og-description">OG Description</Label>
              <textarea
                id="og-description"
                value={description}
                onChange={(e) => onChange?.('description', e.target.value)}
                placeholder="A brief description"
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og-image">OG Image URL</Label>
              <Input
                id="og-image"
                value={image}
                onChange={(e) => onChange?.('image', e.target.value)}
                placeholder="https://example.com/og-image.jpg"
              />
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-gray-500 space-y-1 bg-blue-50 p-3 rounded">
          <p className="font-medium text-blue-900">Social Card Tips:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Recommended image size: 1200 x 630 pixels</li>
            <li>Use JPG or PNG format</li>
            <li>Keep text concise for mobile screens</li>
            <li>Test on both Facebook and Twitter</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
