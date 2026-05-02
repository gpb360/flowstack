import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCalendars, useUpdateCalendar } from '../hooks/useCalendars';
import type { BusinessHours, DayOfWeek } from '../types';
import { DEFAULT_BUSINESS_HOURS } from '../lib/utils';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export function AvailabilityEditor() {
  const { user } = useAuth();
  const organizationId = user?.user_metadata?.organization_id || '';

  const [selectedCalendarId, setSelectedCalendarId] = useState<string>();
  const { data: calendars } = useCalendars(organizationId);
  const updateCalendar = useUpdateCalendar();

  const selectedCalendar = calendars?.find((c) => c.id === selectedCalendarId);
  const businessHours = (selectedCalendar?.business_hours as BusinessHours) || DEFAULT_BUSINESS_HOURS;

  const handleToggleDay = (day: DayOfWeek, enabled: boolean) => {
    if (!selectedCalendarId) return;

    const newHours = {
      ...businessHours,
      [day]: enabled ? [{ start: '09:00', end: '17:00' }] : [],
    };

    updateCalendar.mutate({
      calendarId: selectedCalendarId,
      updates: { business_hours: newHours as any },
    });
  };

  const handleAddTimeRange = (day: DayOfWeek) => {
    if (!selectedCalendarId) return;

    const dayHours = businessHours[day] || [];
    const newHours = {
      ...businessHours,
      [day]: [...dayHours, { start: '09:00', end: '17:00' }],
    };

    updateCalendar.mutate({
      calendarId: selectedCalendarId,
      updates: { business_hours: newHours as any },
    });
  };

  const handleRemoveTimeRange = (day: DayOfWeek, index: number) => {
    if (!selectedCalendarId) return;

    const dayHours = businessHours[day] || [];
    const newHours = {
      ...businessHours,
      [day]: dayHours.filter((_, i) => i !== index),
    };

    updateCalendar.mutate({
      calendarId: selectedCalendarId,
      updates: { business_hours: newHours as any },
    });
  };

  const handleUpdateTimeRange = (
    day: DayOfWeek,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    if (!selectedCalendarId) return;

    const dayHours = businessHours[day] || [];
    const updatedHours = [...dayHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };

    const newHours = {
      ...businessHours,
      [day]: updatedHours,
    };

    updateCalendar.mutate({
      calendarId: selectedCalendarId,
      updates: { business_hours: newHours as any },
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Availability</h1>
            <p className="text-sm text-text-secondary">Set your working hours</p>
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="calendar">Calendar</Label>
            <select
              id="calendar"
              value={selectedCalendarId || ''}
              onChange={(e) => setSelectedCalendarId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
            >
              <option value="">Select a calendar</option>
              {calendars?.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly Hours</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            {!selectedCalendarId ? (
              <CardUntitled className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-text-secondary" />
                <p className="text-text-secondary">Please select a calendar to edit availability</p>
              </CardUntitled>
            ) : (
              <div className="max-w-2xl space-y-4">
                {DAYS.map(({ key, label }) => {
                  const dayHours = businessHours[key] || [];
                  const isEnabled = dayHours.length > 0;

                  return (
                    <CardUntitled key={key} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => handleToggleDay(key, checked)}
                          />
                          <Label className="font-semibold">{label}</Label>
                        </div>

                        {isEnabled && (
                          <ButtonUntitled
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAddTimeRange(key)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Time
                          </ButtonUntitled>
                        )}
                      </div>

                      {isEnabled && (
                        <div className="space-y-2 ml-11">
                          {dayHours.map((range, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="time"
                                value={range.start}
                                onChange={(e) => handleUpdateTimeRange(key, index, 'start', e.target.value)}
                                className="w-32 rounded border border-gray-300 px-2 py-1.5 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={range.end}
                                onChange={(e) => handleUpdateTimeRange(key, index, 'end', e.target.value)}
                                className="w-32 rounded border border-gray-300 px-2 py-1.5 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                              />
                              <ButtonUntitled
                                variant="ghost"
                                size="sm"
                                isIconOnly
                                onClick={() => handleRemoveTimeRange(key, index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </ButtonUntitled>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardUntitled>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl">
              <CardUntitled title="Booking Settings" className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <InputUntitled
                    label="Buffer Time (minutes)"
                    type="number"
                    value={selectedCalendar?.buffer_minutes || 0}
                    onChange={(e) => {
                      if (!selectedCalendarId) return;
                      updateCalendar.mutate({
                        calendarId: selectedCalendarId,
                        updates: { buffer_minutes: Number(e.target.value) },
                      });
                    }}
                    helperText="Time between appointments"
                  />

                  <InputUntitled
                    label="Minimum Notice (hours)"
                    type="number"
                    value={selectedCalendar?.min_notice_hours || 24}
                    onChange={(e) => {
                      if (!selectedCalendarId) return;
                      updateCalendar.mutate({
                        calendarId: selectedCalendarId,
                        updates: { min_notice_hours: Number(e.target.value) },
                      });
                    }}
                    helperText="How soon clients can book"
                  />

                  <InputUntitled
                    label="Max Booking (days ahead)"
                    type="number"
                    value={selectedCalendar?.max_booking_days_ahead || 90}
                    onChange={(e) => {
                      if (!selectedCalendarId) return;
                      updateCalendar.mutate({
                        calendarId: selectedCalendarId,
                        updates: { max_booking_days_ahead: Number(e.target.value) },
                      });
                    }}
                    helperText="Furthest clients can book"
                  />

                  <InputUntitled
                    label="Timezone"
                    value={selectedCalendar?.timezone || 'UTC'}
                    onChange={(e) => {
                      if (!selectedCalendarId) return;
                      updateCalendar.mutate({
                        calendarId: selectedCalendarId,
                        updates: { timezone: e.target.value },
                      });
                    }}
                    helperText="Your calendar timezone"
                  />
                </div>
              </CardUntitled>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
