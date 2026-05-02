import { useState } from 'react';
import { format, isToday, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '../types';
import { generateWeekGrid } from '../lib/utils';

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  onSlotClick: (date: Date) => void;
  onEventClick: (eventId: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function WeekView({ date, events, onSlotClick, onEventClick }: WeekViewProps) {
  const days = generateWeekGrid(date, events);
  const [currentTime] = useState(new Date());

  const weekDays = days.map((d) => format(d.date, 'EEE'));

  const handleSlotClick = (dayIndex: number, hour: number) => {
    const clickedDate = days[dayIndex].date;
    const slotDate = setHours(setMinutes(clickedDate, 0), hour);
    onSlotClick(slotDate);
  };

  const getEventsForSlot = (dayIndex: number, hour: number) => {
    return days[dayIndex].appointments.filter((event) => {
      const eventHour = event.start.getHours();
      return eventHour === hour;
    });
  };

  const getCurrentTimeRow = () => {
    return currentTime.getHours();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="grid grid-cols-8 border-b bg-muted">
        <div className="p-2 border-r" />
        {days.map((day, index) => (
          <div
            key={index}
            className={cn(
              'p-2 text-center border-r',
              isToday(day.date) && 'bg-[#D4AF37]/10'
            )}
          >
            <div className="text-sm font-semibold">{weekDays[index]}</div>
            <div
              className={cn(
                'mt-1 flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold mx-auto',
                isToday(day.date) && 'bg-[#D4AF37] text-white'
              )}
            >
              {format(day.date, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 min-h-[1440px]">
          {/* Time Column */}
          <div className="border-r bg-muted">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b pr-2 text-right text-xs text-text-secondary"
              >
                {format(setHours(new Date(), hour), 'ha')}
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-r">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  onClick={() => handleSlotClick(dayIndex, hour)}
                  className="h-[60px] border-b cursor-pointer hover:bg-muted/50 transition-colors relative"
                >
                  {/* Events for this hour */}
                  {getEventsForSlot(dayIndex, hour).map((event) => {
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
                          'absolute left-1 right-1 rounded px-2 py-1 text-xs font-medium cursor-pointer overflow-hidden',
                          'hover:opacity-80'
                        )}
                        style={{
                          backgroundColor: event.color || '#D4AF37',
                          top: `${top}px`,
                          height: `${duration * 60 - 2}px`,
                        }}
                      >
                        <div className="truncate">{event.title}</div>
                        {duration > 1 && (
                          <div className="text-[10px] opacity-80">
                            {format(event.start, 'h:mm')} - {format(event.end, 'h:mm')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Current Time Indicator */}
              {isToday(day.date) && (
                <div
                  className="absolute left-0 right-0 border-t-2 border-[#D4AF37] z-10"
                  style={{
                    top: `${getCurrentTimeRow() * 60 + (currentTime.getMinutes() / 60) * 60}px`,
                  }}
                >
                  <div className="h-2 w-2 rounded-full bg-[#D4AF37] -mt-1.5 -ml-1" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
