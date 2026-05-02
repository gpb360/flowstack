import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Grid3x3, Clock, Settings } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { useAuth } from '@/context/AuthContext';
import { useAppointments, useUpcomingAppointments } from '../hooks/useAppointments';
import { useCalendars } from '../hooks/useCalendars';
import { type ViewMode, type CalendarEvent } from '../lib/utils';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AgendaView } from './AgendaView';
import { MiniCalendar } from './MiniCalendar';
import { CalendarFilters } from './CalendarFilters';
import { NewAppointmentDialog } from './NewAppointmentDialog';

export function CalendarView() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCalendar, setSelectedCalendar] = useState<string | undefined>();
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

  // Fetch organization ID from user context (simplified)
  const organizationId = user?.user_metadata?.organization_id || '';

  // Fetch data
  const { data: calendars } = useCalendars(organizationId);
  const { data: upcomingAppointments } = useUpcomingAppointments(organizationId, 5);

  // Fetch appointments for selected date range
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const { data: appointments = [] } = useAppointments({
    organizationId,
    dateFrom: monthStart,
    dateTo: monthEnd,
    calendarId: selectedCalendar,
  });

  // Convert appointments to calendar events
  const calendarEvents: CalendarEvent[] = appointments.map((apt) => ({
    id: apt.id,
    title: apt.title,
    start: new Date(apt.start_time),
    end: new Date(apt.end_time),
    color: calendars?.find((c) => c.id === apt.calendar_id)?.color || '#3b82f6',
    calendarId: apt.calendar_id || '',
    appointment: apt,
  }));

  const handlePrevious = () => {
    setSelectedDate((prev) => subMonths(prev, 1));
  };

  const handleNext = () => {
    setSelectedDate((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (viewMode === 'month') {
      setViewMode('day');
    }
  };

  const handleEventClick = (eventId: string) => {
    // Open appointment details dialog
    console.log('Event clicked:', eventId);
  };

  const handleSlotClick = (date: Date) => {
    setSelectedDate(date);
    setIsNewAppointmentOpen(true);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-background p-4 flex flex-col">
        <div className="mb-4">
          <ButtonUntitled
            className="w-full"
            onClick={() => setIsNewAppointmentOpen(true)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            New Appointment
          </ButtonUntitled>
        </div>

        <MiniCalendar
          selected={selectedDate}
          onSelect={setSelectedDate}
          events={calendarEvents}
        />

        <div className="mt-4 flex-1 overflow-y-auto">
          <h3 className="mb-2 font-semibold text-sm uppercase text-muted-foreground">
            Upcoming
          </h3>
          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            <div className="space-y-2">
              {upcomingAppointments.map((apt) => (
                <CardUntitled
                  key={apt.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleEventClick(apt.id)}
                >
                  <div className="p-2">
                    <div className="font-medium text-sm">{apt.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(apt.start_time), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </CardUntitled>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming appointments</p>
          )}
        </div>

        <CalendarFilters
          calendars={calendars || []}
          selectedCalendar={selectedCalendar}
          onCalendarChange={setSelectedCalendar}
        />
      </aside>

      {/* Main Calendar */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ButtonUntitled variant="ghost" size="sm" isIconOnly onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </ButtonUntitled>
                <ButtonUntitled variant="ghost" size="sm" isIconOnly onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </ButtonUntitled>
                <ButtonUntitled variant="ghost" size="sm" onClick={handleToday}>
                  Today
                </ButtonUntitled>
              </div>

              <h2 className="text-2xl font-bold">
                {format(selectedDate, 'MMMM yyyy')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Custom Tabs */}
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('month')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'month'
                      ? 'bg-[#D4AF37] text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Grid3x3 className="h-4 w-4" />
                  Month
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'week'
                      ? 'bg-[#D4AF37] text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Week
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'day'
                      ? 'bg-[#D4AF37] text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Day
                </button>
                <button
                  onClick={() => setViewMode('agenda')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'agenda'
                      ? 'bg-[#D4AF37] text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <List className="h-4 w-4" />
                  Agenda
                </button>
              </div>

              <ButtonUntitled variant="ghost" size="sm" isIconOnly>
                <Settings className="h-4 w-4" />
              </ButtonUntitled>
            </div>
          </div>
        </header>

        {/* Calendar Views */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'month' && (
            <MonthView
              date={selectedDate}
              events={calendarEvents}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          )}

          {viewMode === 'week' && (
            <WeekView
              date={selectedDate}
              events={calendarEvents}
              onSlotClick={handleSlotClick}
              onEventClick={handleEventClick}
            />
          )}

          {viewMode === 'day' && (
            <DayView
              date={selectedDate}
              events={calendarEvents}
              onSlotClick={handleSlotClick}
              onEventClick={handleEventClick}
            />
          )}

          {viewMode === 'agenda' && (
            <AgendaView
              date={selectedDate}
              events={calendarEvents}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </main>

      {/* New Appointment Dialog */}
      <NewAppointmentDialog
        open={isNewAppointmentOpen}
        onOpenChange={setIsNewAppointmentOpen}
        defaultDate={selectedDate}
        calendarId={selectedCalendar}
      />
    </div>
  );
}
