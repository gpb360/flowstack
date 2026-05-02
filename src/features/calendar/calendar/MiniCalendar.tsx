import { format, startOfMonth, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '../types';

interface MiniCalendarProps {
  selected: Date;
  onSelect: (date: Date) => void;
  events: CalendarEvent[];
}

export function MiniCalendar({ selected, onSelect, events }: MiniCalendarProps) {
  const monthStart = startOfMonth(selected);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay());

  const days: Date[] = [];
  const currentDay = new Date(calendarStart);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const hasEventsOnDay = (date: Date): boolean => {
    return events.some((event) =>
      format(event.start, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="bg-muted rounded-lg p-3">
      <div className="mb-2 text-center">
        <div className="text-sm font-semibold">
          {format(selected, 'MMMM yyyy')}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div key={day} className="text-text-secondary font-medium py-1">
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, selected);
          const isSelected = isSameDay(day, selected);
          const isDayToday = isToday(day);
          const hasEvents = hasEventsOnDay(day);

          return (
            <button
              key={index}
              onClick={() => onSelect(day)}
              className={cn(
                'h-7 w-7 rounded flex items-center justify-center relative',
                'hover:bg-muted-foreground/10 transition-colors',
                !isCurrentMonth && 'text-text-secondary',
                isSelected && 'bg-[#D4AF37] text-white hover:bg-[#D4AF37]',
                isDayToday && !isSelected && 'border border-[#D4AF37]',
                !isSelected && isDayToday && 'font-semibold'
              )}
            >
              <span>{format(day, 'd')}</span>

              {/* Event indicator */}
              {hasEvents && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
