import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Calendar } from '../types';

interface CalendarFiltersProps {
  calendars: Calendar[];
  selectedCalendar: string | undefined;
  onCalendarChange: (calendarId: string | undefined) => void;
}

export function CalendarFilters({
  calendars,
  selectedCalendar,
  onCalendarChange,
}: CalendarFiltersProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-semibold">Calendars</Label>
      </div>

      <div className="space-y-2">
        {/* All Calendars Option */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border border-border"
              style={{ backgroundColor: selectedCalendar ? undefined : '#D4AF37' }}
            />
            <Label className="text-sm cursor-pointer" htmlFor="all-calendars">
              All Calendars
            </Label>
          </div>
          <Switch
            id="all-calendars"
            checked={!selectedCalendar}
            onCheckedChange={(checked) => {
              if (checked) {
                onCalendarChange(undefined);
              }
            }}
          />
        </div>

        {/* Individual Calendars */}
        {calendars.map((calendar) => (
          <div key={calendar.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: calendar.color }}
              />
              <Label
                className="text-sm cursor-pointer"
                htmlFor={`calendar-${calendar.id}`}
              >
                {calendar.name}
              </Label>
            </div>
            <Switch
              id={`calendar-${calendar.id}`}
              checked={selectedCalendar === calendar.id}
              onCheckedChange={(checked) => {
                if (checked) {
                  onCalendarChange(calendar.id);
                } else if (selectedCalendar === calendar.id) {
                  onCalendarChange(undefined);
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
