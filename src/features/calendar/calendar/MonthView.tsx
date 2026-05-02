// React import not needed
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '../types';
import { generateMonthGrid } from '../lib/utils';

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (eventId: string) => void;
}

export function MonthView({ date, events, onDateClick, onEventClick }: MonthViewProps) {
  const weeks = generateMonthGrid(date, events);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="grid grid-cols-7 border-b bg-muted">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-semibold text-text-secondary"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 auto-rows-fr">
          {weeks.map((week) =>
            week.days.map((day) => (
              <div
                key={day.date.toISOString()}
                onClick={() => onDateClick(day.date)}
                className={cn(
                  'relative min-h-[100px] border-b border-r p-1 cursor-pointer transition-colors',
                  'hover:bg-muted/50',
                  !day.isCurrentMonth && 'bg-muted/30',
                  isToday(day.date) && 'bg-[#D4AF37]/10'
                )}
              >
                {/* Date Number */}
                <div
                  className={cn(
                    'mb-1 flex h-7 w-7 items-center justify-center text-sm font-medium',
                    !day.isCurrentMonth && 'text-text-secondary',
                    isToday(day.date) &&
                      'rounded-full bg-[#D4AF37] text-white'
                  )}
                >
                  {format(day.date, 'd')}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {day.appointments.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event.id);
                      }}
                      className={cn(
                        'truncate rounded px-1 py-0.5 text-xs font-medium cursor-pointer',
                        'hover:opacity-80',
                        'text-white'
                      )}
                      style={{ backgroundColor: event.color || '#D4AF37' }}
                    >
                      {event.title}
                    </div>
                  ))}

                  {day.appointments.length > 3 && (
                    <div
                      className="truncate px-1 text-xs text-text-secondary cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateClick(day.date);
                      }}
                    >
                      +{day.appointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
