/**
 * Availability Editor Component
 * Configure agent availability and business hours
 */

import { InputUntitled } from '@/components/ui/input-untitled';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { Plus, X, Clock } from 'lucide-react';
import type { ChatSettings, AvailabilityHours, TimeRange } from '../types';

interface AvailabilityEditorProps {
  settings: Partial<ChatSettings>;
  onChange: (settings: Partial<ChatSettings>) => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export function AvailabilityEditor({ settings, onChange }: AvailabilityEditorProps) {
  const availabilityHours = settings.availability_hours || {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  const handleTimeRangeChange = (
    day: keyof AvailabilityHours,
    index: number,
    field: keyof TimeRange,
    value: string
  ) => {
    const newHours = { ...availabilityHours };
    newHours[day][index][field] = value;
    onChange({ ...settings, availability_hours: newHours });
  };

  const addTimeRange = (day: keyof AvailabilityHours) => {
    const newHours = { ...availabilityHours };
    newHours[day].push({ start: '09:00', end: '17:00' });
    onChange({ ...settings, availability_hours: newHours });
  };

  const removeTimeRange = (day: keyof AvailabilityHours, index: number) => {
    const newHours = { ...availabilityHours };
    newHours[day].splice(index, 1);
    onChange({ ...settings, availability_hours: newHours });
  };

  return (
    <div className="space-y-6 rounded-lg border bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Availability</h2>
        <p className="text-sm text-gray-600">
          Configure when your agents are available to chat
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="availability_enabled">Enable Availability</label>
          <p className="text-sm text-gray-600">
            Show/hide widget based on business hours
          </p>
        </div>
        <Switch
          id="availability_enabled"
          checked={settings.availability_enabled ?? false}
          onCheckedChange={(checked) =>
            onChange({ ...settings, availability_enabled: checked })
          }
        />
      </div>

      {settings.availability_enabled && (
        <>
          <div className="space-y-2">
            <label htmlFor="availability_timezone">Timezone</label>
            <Select
              value={settings.availability_timezone || 'UTC'}
              onValueChange={(value) =>
                onChange({ ...settings, availability_timezone: value })
              }
            >
              <SelectTrigger id="availability_timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">GMT</SelectItem>
                <SelectItem value="Europe/Paris">Central European</SelectItem>
                <SelectItem value="Asia/Tokyo">Japan</SelectItem>
                <SelectItem value="Australia/Sydney">Australia Eastern</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Business Hours</h3>

            {DAYS.map((day) => (
              <div key={day} className="space-y-2">
                <label className="capitalize">{DAY_LABELS[day]}</label>

                {availabilityHours[day]?.length === 0 ? (
                  <ButtonUntitled
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeRange(day)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Hours
                  </ButtonUntitled>
                ) : (
                  <div className="space-y-2">
                    {availabilityHours[day].map((range, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <InputUntitled
                          type="time"
                          value={range.start}
                          onChange={(e) =>
                            handleTimeRangeChange(day, index, 'start', e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-gray-500">to</span>
                        <InputUntitled
                          type="time"
                          value={range.end}
                          onChange={(e) =>
                            handleTimeRangeChange(day, index, 'end', e.target.value)
                          }
                          className="w-32"
                        />
                        <ButtonUntitled
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeRange(day, index)}
                        >
                          <X className="h-4 w-4" />
                        </ButtonUntitled>
                      </div>
                    ))}
                    <ButtonUntitled
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeRange(day)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Time Range
                    </ButtonUntitled>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="offline_action">When Offline</label>
            <Select
              value={settings.offline_action || 'collect_message'}
              onValueChange={(value) =>
                onChange({ ...settings, offline_action: value as any })
              }
            >
              <SelectTrigger id="offline_action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hide_widget">Hide Widget</SelectItem>
                <SelectItem value="collect_message">Collect Message</SelectItem>
                <SelectItem value="show_schedule">Show Schedule</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              What should happen when agents are offline
            </p>
          </div>
        </>
      )}

      {/* Agent Assignment */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Agent Assignment</h3>

        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="agent_assignment_enabled">Enable Auto Assignment</label>
            <p className="text-sm text-gray-600">
              Automatically assign conversations to agents
            </p>
          </div>
          <Switch
            id="agent_assignment_enabled"
            checked={settings.agent_assignment_enabled ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...settings, agent_assignment_enabled: checked })
            }
          />
        </div>

        {settings.agent_assignment_enabled && (
          <>
            <div className="space-y-2">
              <label htmlFor="agent_assignment_type">Assignment Type</label>
              <Select
                value={settings.agent_assignment_type || 'round_robin'}
                onValueChange={(value) =>
                  onChange({ ...settings, agent_assignment_type: value as any })
                }
              >
                <SelectTrigger id="agent_assignment_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="least_active">Least Active</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="max_concurrent_chats">
                Max Concurrent Chats per Agent
              </label>
              <InputUntitled
                id="max_concurrent_chats"
                type="number"
                min={1}
                max={50}
                value={settings.max_concurrent_chats || 5}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    max_concurrent_chats: parseInt(e.target.value) || 5,
                  })
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
