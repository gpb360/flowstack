// @ts-nocheck
import { Button } from '@/components/ui/button-untitled';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SchedulePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
}

export function SchedulePicker({ value, onChange, minDate }: SchedulePickerProps) {
  const minDateDefault = minDate || new Date(Date.now() + 15 * 60 * 1000); // At least 15 minutes in future

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // If no time selected yet, set to next hour
    if (!value) {
      const newDate = new Date(date);
      newDate.setHours(newDate.getHours() + 1, 0, 0, 0);
      onChange(newDate);
    } else {
      // Keep the existing time, change the date
      const newDate = new Date(date);
      newDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
      onChange(newDate);
    }
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    if (!value) return;

    const newDate = new Date(value);
    newDate.setHours(hours, minutes, 0, 0);
    onChange(newDate);
  };

  const quickTimes = [
    { label: 'Morning', hours: 9 },
    { label: 'Noon', hours: 12 },
    { label: 'Afternoon', hours: 15 },
    { label: 'Evening', hours: 18 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Select Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !value && 'text-text-secondary'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={handleDateSelect}
              disabled={(date) => date < minDateDefault}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {value && (
        <>
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Select Time</label>
            <div className="grid grid-cols-2 gap-2">
              {quickTimes.map((time) => (
                <Button
                  key={time.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeChange(time.hours, 0)}
                >
                  {time.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Custom Time</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="23"
                value={value.getHours()}
                onChange={(e) => handleTimeChange(parseInt(e.target.value) || 0, value.getMinutes())}
                className="w-20 px-3 py-2 border rounded-lg"
              />
              <span className="flex items-center">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={value.getMinutes()}
                onChange={(e) => handleTimeChange(value.getHours(), parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Scheduled for:</span>
              <span>{format(value, 'PPP')}</span>
              <span>at</span>
              <span>{format(value, 'p')}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
