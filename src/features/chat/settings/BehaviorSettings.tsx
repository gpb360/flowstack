/**
 * Behavior Settings Component
 * Configure the behavior and features of the chat widget
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import type { ChatSettings } from '../types';

interface BehaviorSettingsProps {
  settings: Partial<ChatSettings>;
  onChange: (settings: Partial<ChatSettings>) => void;
}

export function BehaviorSettings({ settings, onChange }: BehaviorSettingsProps) {
  return (
    <div className="space-y-6 rounded-lg border bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Widget Behavior</h2>
        <p className="text-sm text-gray-600">
          Configure how the chat widget behaves and interacts
        </p>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Messages</h3>

        <div className="space-y-2">
          <Label htmlFor="welcome_message">Welcome Message</Label>
          <Input
            id="welcome_message"
            value={settings.welcome_message || 'How can we help you?'}
            onChange={(e) => onChange({ ...settings, welcome_message: e.target.value })}
            placeholder="How can we help you?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="offline_message">Offline Message</Label>
          <Textarea
            id="offline_message"
            value={
              settings.offline_message ||
              'We are currently offline. Leave a message and we will get back to you.'
            }
            onChange={(e) => onChange({ ...settings, offline_message: e.target.value })}
            rows={3}
            placeholder="We are currently offline..."
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sound_enabled">Enable Sound</Label>
            <p className="text-sm text-gray-600">
              Play notification sound for new messages
            </p>
          </div>
          <Switch
            id="sound_enabled"
            checked={settings.sound_enabled ?? true}
            onCheckedChange={(checked) =>
              onChange({ ...settings, sound_enabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="typing_indicator_enabled">Show Typing Indicator</Label>
            <p className="text-sm text-gray-600">
              Show when agent is typing
            </p>
          </div>
          <Switch
            id="typing_indicator_enabled"
            checked={settings.typing_indicator_enabled ?? true}
            onCheckedChange={(checked) =>
              onChange({ ...settings, typing_indicator_enabled: checked })
            }
          />
        </div>
      </div>

      {/* Pre-Chat Form */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Pre-Chat Form</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="pre_chat_form_enabled">Enable Pre-Chat Form</Label>
            <p className="text-sm text-gray-600">
              Collect visitor information before chat starts
            </p>
          </div>
          <Switch
            id="pre_chat_form_enabled"
            checked={settings.pre_chat_form_enabled ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...settings, pre_chat_form_enabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="collect_name">Collect Name</Label>
          </div>
          <Switch
            id="collect_name"
            checked={settings.collect_name ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...settings, collect_name: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="collect_email">Collect Email</Label>
          </div>
          <Switch
            id="collect_email"
            checked={settings.collect_email ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...settings, collect_email: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="collect_phone">Collect Phone</Label>
          </div>
          <Switch
            id="collect_phone"
            checked={settings.collect_phone ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...settings, collect_phone: checked })
            }
          />
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">File Upload</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="file_upload_enabled">Enable File Upload</Label>
            <p className="text-sm text-gray-600">
              Allow visitors to upload files
            </p>
          </div>
          <Switch
            id="file_upload_enabled"
            checked={settings.file_upload_enabled ?? true}
            onCheckedChange={(checked) =>
              onChange({ ...settings, file_upload_enabled: checked })
            }
          />
        </div>

        {settings.file_upload_enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="file_upload_max_size">
                Max File Size (MB): {Math.round((settings.file_upload_max_size || 10485760) / 1024 / 1024)}
              </Label>
              <Slider
                id="file_upload_max_size"
                min={1}
                max={50}
                step={1}
                value={[Math.round((settings.file_upload_max_size || 10485760) / 1024 / 1024)]}
                onValueChange={([value]) =>
                  onChange({ ...settings, file_upload_max_size: value * 1024 * 1024 })
                }
              />
            </div>
          </>
        )}
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Additional Features</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="emoji_picker_enabled">Enable Emoji Picker</Label>
            <p className="text-sm text-gray-600">
              Allow visitors to use emojis
            </p>
          </div>
          <Switch
            id="emoji_picker_enabled"
            checked={settings.emoji_picker_enabled ?? true}
            onCheckedChange={(checked) =>
              onChange({ ...settings, emoji_picker_enabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="rating_enabled">Enable Rating</Label>
            <p className="text-sm text-gray-600">
              Allow visitors to rate conversations
            </p>
          </div>
          <Switch
            id="rating_enabled"
            checked={settings.rating_enabled ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...settings, rating_enabled: checked })
            }
          />
        </div>

        {settings.rating_enabled && (
          <div className="space-y-2">
            <Label htmlFor="rating_question">Rating Question</Label>
            <Input
              id="rating_question"
              value={settings.rating_question || 'How would you rate this conversation?'}
              onChange={(e) => onChange({ ...settings, rating_question: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Auto Response */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Auto Response</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto_response_enabled">Enable Auto Response</Label>
            <p className="text-sm text-gray-600">
              Automatically send a response when agents are unavailable
            </p>
          </div>
          <Switch
            id="auto_response_enabled"
            checked={settings.auto_response_enabled ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...settings, auto_response_enabled: checked })
            }
          />
        </div>

        {settings.auto_response_enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="auto_response_delay">
                Delay (seconds): {settings.auto_response_delay || 5}
              </Label>
              <Slider
                id="auto_response_delay"
                min={1}
                max={60}
                step={1}
                value={[settings.auto_response_delay || 5]}
                onValueChange={([value]) =>
                  onChange({ ...settings, auto_response_delay: value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto_response_message">Auto Response Message</Label>
              <Textarea
                id="auto_response_message"
                value={
                  settings.auto_response_message ||
                  'Thanks for reaching out! An agent will be with you shortly.'
                }
                onChange={(e) =>
                  onChange({ ...settings, auto_response_message: e.target.value })
                }
                rows={3}
              />
            </div>
          </>
        )}
      </div>

      {/* Security */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Security</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="rate_limit_enabled">Enable Rate Limiting</Label>
            <p className="text-sm text-gray-600">
              Limit message frequency to prevent spam
            </p>
          </div>
          <Switch
            id="rate_limit_enabled"
            checked={settings.rate_limit_enabled ?? true}
            onCheckedChange={(checked) =>
              onChange({ ...settings, rate_limit_enabled: checked })
            }
          />
        </div>

        {settings.rate_limit_enabled && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rate_limit_max_messages">Max Messages</Label>
              <Input
                id="rate_limit_max_messages"
                type="number"
                value={settings.rate_limit_max_messages || 100}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    rate_limit_max_messages: parseInt(e.target.value) || 100,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate_limit_window">Window (seconds)</Label>
              <Input
                id="rate_limit_window"
                type="number"
                value={settings.rate_limit_window || 3600}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    rate_limit_window: parseInt(e.target.value) || 3600,
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
