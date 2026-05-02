import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '../types';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';

interface AgendaViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
}

export function AgendaView({ date, events, onEventClick }: AgendaViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Group events by date
  const eventsByDate = days.map((day) => ({
    date: day,
    events: events.filter((event) => isSameDay(event.start, day)),
  }));

  const hasEvents = eventsByDate.some((d) => d.events.length > 0);

  return (
    <div className="h-full overflow-auto bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">
          {format(date, 'MMMM yyyy')}
        </h2>

        {!hasEvents ? (
          <CardUntitled className="p-12 text-center">
            <div className="text-text-secondary">
              <p className="text-lg font-medium mb-2">No events this week</p>
              <p className="text-sm">Events will appear here when you schedule appointments.</p>
            </div>
          </CardUntitled>
        ) : (
          <div className="space-y-6">
            {eventsByDate.map(({ date: dayDate, events: dayEvents }) => {
              if (dayEvents.length === 0) return null;

              return (
                <div key={dayDate.toISOString()}>
                  {/* Date Header */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold">
                      {format(dayDate, 'EEEE, MMMM d')}
                    </h3>
                    {format(dayDate, 'yyyy-MM-dd') ===
                      format(new Date(), 'yyyy-MM-dd') && (
                      <BadgeUntitled variant="info" size="sm" className="mt-1">
                        Today
                      </BadgeUntitled>
                    )}
                  </div>

                  {/* Events */}
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <CardUntitled
                        key={event.id}
                        onClick={() => onEventClick(event.id)}
                        className={cn(
                          'p-4 cursor-pointer transition-shadow hover:shadow-md',
                          'border-l-4'
                        )}
                        style={{ borderLeftColor: event.color || '#D4AF37' }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{event.title}</h4>
                              {event.appointment && (
                                <BadgeUntitled
                                  variant="neutral"
                                  size="sm"
                                >
                                  {event.appointment.status}
                                </BadgeUntitled>
                              )}
                            </div>

                            <div className="text-sm text-text-secondary space-y-1">
                              <div className="flex items-center gap-4">
                                <span>
                                  {format(event.start, 'h:mm a')} -{' '}
                                  {format(event.end, 'h:mm a')}
                                </span>
                                <span>
                                  {Math.round(
                                    (event.end.getTime() -
                                      event.start.getTime()) /
                                      3600000
                                  )}{' '}
                                  hours
                                </span>
                              </div>

                              {event.appointment?.location && (
                                <div className="text-xs">
                                  {event.appointment.location}
                                </div>
                              )}

                              {event.appointment?.customer_name && (
                                <div className="text-xs">
                                  with {event.appointment.customer_name}
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: event.color || '#D4AF37' }}
                          />
                        </div>
                      </CardUntitled>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
