/**
 * Appearance Settings Component
 * Customize the visual appearance of the chat widget
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ChatSettings } from '../types';

interface AppearanceSettingsProps {
  settings: Partial<ChatSettings>;
  onChange: (settings: Partial<ChatSettings>) => void;
}

export function AppearanceSettings({ settings, onChange }: AppearanceSettingsProps) {
  return (
    <div className="space-y-6 rounded-lg border bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Widget Appearance</h2>
        <p className="text-sm text-gray-600">
          Customize how your chat widget looks
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Widget Color */}
        <div className="space-y-2">
          <Label htmlFor="widget_color">Widget Color</Label>
          <div className="flex gap-2">
            <Input
              id="widget_color"
              type="color"
              value={settings.widget_color || '#3B82F6'}
              onChange={(e) => onChange({ ...settings, widget_color: e.target.value })}
              className="h-10 w-20"
            />
            <Input
              type="text"
              value={settings.widget_color || '#3B82F6'}
              onChange={(e) => onChange({ ...settings, widget_color: e.target.value })}
              placeholder="#3B82F6"
              className="flex-1"
            />
          </div>
        </div>

        {/* Widget Position */}
        <div className="space-y-2">
          <Label htmlFor="widget_position">Widget Position</Label>
          <Select
            value={settings.widget_position || 'bottom-right'}
            onValueChange={(value) =>
              onChange({ ...settings, widget_position: value as 'bottom-right' | 'bottom-left' })
            }
          >
            <SelectTrigger id="widget_position">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom-right">Bottom Right</SelectItem>
              <SelectItem value="bottom-left">Bottom Left</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Widget Icon */}
        <div className="space-y-2">
          <Label htmlFor="widget_icon">Widget Icon</Label>
          <Select
            value={settings.widget_icon || 'message-square'}
            onValueChange={(value) => onChange({ ...settings, widget_icon: value })}
          >
            <SelectTrigger id="widget_icon">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="message-square">Message Square</SelectItem>
              <SelectItem value="message-circle">Message Circle</SelectItem>
              <SelectItem value="comment">Comment</SelectItem>
              <SelectItem value="headset">Headset</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <Label htmlFor="header_title">Header Title</Label>
          <Input
            id="header_title"
            value={settings.header_title || 'Chat with us'}
            onChange={(e) => onChange({ ...settings, header_title: e.target.value })}
            placeholder="Chat with us"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Header Options</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show_agent_avatar">Show Agent Avatar</Label>
            <p className="text-sm text-gray-600">
              Display agent profile picture in header
            </p>
          </div>
          <Switch
            id="show_agent_avatar"
            checked={settings.show_agent_avatar ?? true}
            onCheckedChange={(checked) =>
              onChange({ ...settings, show_agent_avatar: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show_agent_name">Show Agent Name</Label>
            <p className="text-sm text-gray-600">
              Display agent name in header
            </p>
          </div>
          <Switch
            id="show_agent_name"
            checked={settings.show_agent_name ?? true}
            onCheckedChange={(checked) =>
              onChange({ ...settings, show_agent_name: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show_agent_status">Show Agent Status</Label>
            <p className="text-sm text-gray-600">
              Display online/offline status indicator
            </p>
          </div>
          <Switch
            id="show_agent_status"
            checked={settings.show_agent_status ?? true}
            onCheckedChange={(checked) =>
              onChange({ ...settings, show_agent_status: checked })
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Custom Styling</h3>

        <div className="space-y-2">
          <Label htmlFor="custom_css">Custom CSS</Label>
          <textarea
            id="custom_css"
            value={settings.custom_css || ''}
            onChange={(e) => onChange({ ...settings, custom_css: e.target.value })}
            placeholder="/* Add custom CSS here */"
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Branding */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Branding</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="branding_hide_logo">Hide Logo</Label>
            <p className="text-sm text-gray-600">
              Remove FlowStack branding from widget
            </p>
          </div>
          <Switch
            id="branding_hide_logo"
            checked={settings.branding_hide_logo ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...settings, branding_hide_logo: checked })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="branding_custom_logo">Custom Logo URL</Label>
          <Input
            id="branding_custom_logo"
            value={settings.branding_custom_logo || ''}
            onChange={(e) =>
              onChange({ ...settings, branding_custom_logo: e.target.value })
            }
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="branding_custom_name">Custom Name</Label>
          <Input
            id="branding_custom_name"
            value={settings.branding_custom_name || ''}
            onChange={(e) =>
              onChange({ ...settings, branding_custom_name: e.target.value })
            }
            placeholder="Your Company Name"
          />
        </div>
      </div>
    </div>
  );
}
