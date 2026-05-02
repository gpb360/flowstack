import { useState } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '../types';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onSlotClick: (date: Date) => void;
  onEventClick: (eventId: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function DayView({ date, events, onSlotClick, onEventClick }: DayViewProps) {
  const [currentTime] = useState(new Date());

  // Filter events for the selected date
  const dayEvents = events.filter((event) =>
    format(event.start, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );

  const handleSlotClick = (hour: number) => {
    const slotDate = setHours(setMinutes(new Date(date), 0), hour);
    onSlotClick(slotDate);
  };

  const getEventsForSlot = (hour: number) => {
    return dayEvents.filter((event) => event.start.getHours() === hour);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-muted p-4 text-center">
        <div className="text-sm font-semibold text-text-secondary">
          {format(date, 'EEEE')}
        </div>
        <div className="text-3xl font-bold">{format(date, 'd')}</div>
        <div className="text-sm text-text-secondary">{format(date, 'MMMM yyyy')}</div>
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[80px_1fr] min-h-[1440px]">
          {/* Time Labels */}
          <div className="border-r bg-muted">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b pr-2 text-right text-xs text-text-secondary flex items-end justify-end pb-1"
              >
                {format(setHours(new Date(), hour), 'ha')}
              </div>
            ))}
          </div>

          {/* Events Column */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                onClick={() => handleSlotClick(hour)}
                className="h-[60px] border-b cursor-pointer hover:bg-muted/50 transition-colors relative"
              >
                {/* Events for this hour */}
                {getEventsForSlot(hour).map((event) => {
                  const duration = Math.ceil(
                    (event.end.getTime() - event.start.getTime()) / 3600000
                  );
                  const startMinute = event.start.getMinutes();
                  const top = (startMinute / 60) * 60;

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event.id);
                      }}
                      className={cn(
                        'absolute left-2 right-2 rounded-lg px-3 py-2 text-sm cursor-pointer shadow-sm',
                        'hover:shadow-md transition-shadow'
                      )}
                      style={{
                        backgroundColor: event.color || '#D4AF37',
                        top: `${top}px`,
                        height: `${duration * 60 - 4}px`,
                      }}
                    >
                      <div className="font-semibold text-white truncate">{event.title}</div>
                      <div className="text-xs text-white/80">
                        {format(event.start, 'h:mm')} - {format(event.end, 'h:mm')}
                      </div>
                      {duration > 1 && (
                        <div className="text-xs text-white/70 mt-1">
                          {duration}h
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Current Time Indicator */}
            {format(date, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd') && (
              <div
                className="absolute left-0 right-0 border-t-2 border-[#D4AF37] z-10"
                style={{
                  top: `${currentTime.getHours() * 60 + (currentTime.getMinutes() / 60) * 60}px`,
                }}
              >
                <div className="h-2 w-2 rounded-full bg-[#D4AF37] -mt-1.5 -ml-1" />
                <span className="ml-2 text-xs text-[#D4AF37] font-medium">
                  {format(currentTime, 'h:mm a')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
