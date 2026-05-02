# Calendar & Appointments Module

Complete calendar and appointment booking system for FlowStack.

## Features

### Core Functionality
- **Calendar Views**: Month, Week, Day, and Agenda views
- **Appointment Management**: Create, edit, cancel, and reschedule appointments
- **Availability Management**: Set business hours and availability rules
- **Booking Pages**: Public booking pages for clients
- **Multiple Calendars**: Support for multiple calendars per organization
- **CRM Integration**: Link appointments to contacts

### Key Features
- Visual calendar with drag-and-drop support
- Recurring availability slots
- Buffer time and notice period settings
- Appointment reminders (email/SMS)
- Calendar sync ready (Google, Outlook)
- Meeting link generation
- Appointment history tracking

## Directory Structure

```
src/features/calendar/
├── types.ts                          # TypeScript types
├── lib/
│   ├── utils.ts                      # Date & time utilities
│   ├── availability.ts               # Availability calculation
│   └── booking.ts                    # Booking logic
├── hooks/
│   ├── useAppointments.ts            # Appointment queries & mutations
│   ├── useCalendars.ts               # Calendar queries & mutations
│   └── useAvailability.ts            # Availability queries
├── calendar/
│   ├── CalendarView.tsx              # Main calendar view
│   ├── MonthView.tsx                 # Month calendar grid
│   ├── WeekView.tsx                  # Week time grid
│   ├── DayView.tsx                   # Day time grid
│   ├── AgendaView.tsx                # List agenda view
│   ├── MiniCalendar.tsx              # Sidebar mini calendar
│   ├── CalendarFilters.tsx           # Calendar filter sidebar
│   └── NewAppointmentDialog.tsx      # Create appointment dialog
├── appointments/
│   └── AppointmentsList.tsx          # Appointments list view
├── booking/
│   └── BookingPage.tsx               # Public booking page
├── availability/
│   └── AvailabilityEditor.tsx        # Availability settings
├── sync/
│   └── (future) Calendar sync UI
├── CalendarLayout.tsx                # Module layout
└── index.ts                          # Exports
```

## Database Schema

The calendar module uses 6 tables from `db/calendar_schema.sql`:

1. **calendars** - User calendars with settings
2. **appointment_types** - Configurable appointment types
3. **availability_slots** - Available time slots
4. **appointments** - Booked appointments
5. **appointment_reminders** - Automated reminders
6. **appointment_history** - Audit trail

## Usage

### Calendar View

```tsx
import { CalendarView } from '@/features/calendar';

<CalendarView />
```

### Create Appointment

```tsx
import { useCreateAppointment } from '@/features/calendar/hooks/useAppointments';

const createAppointment = useCreateAppointment();

await createAppointment.mutateAsync({
  organizationId,
  calendar_id: calendarId,
  title: 'Meeting',
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 3600000).toISOString(),
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  status: 'scheduled',
});
```

### Check Availability

```tsx
import { checkAvailability } from '@/features/calendar/lib/availability';

const { available } = await checkAvailability(
  calendarId,
  startTime,
  endTime
);
```

### Public Booking Page

Access at: `/booking/:appointmentTypeId`

Clients can:
1. Select a date from the next 30 days
2. Choose an available time slot
3. Enter their details
4. Confirm booking

## Hooks

### useAppointments

```tsx
const { data: appointments, isLoading } = useAppointments({
  organizationId,
  dateFrom: startDate,
  dateTo: endDate,
  status: 'scheduled',
});
```

### useCalendars

```tsx
const { data: calendars } = useCalendars(organizationId);
```

### useAvailability

```tsx
const { data: slots } = useAvailableSlots({
  calendarId,
  startDate,
  endDate,
  duration: 60,
});
```

### useTodaysAppointments

```tsx
const { data: todayAppointments } = useTodaysAppointments(organizationId);
```

## Integration Points

### CRM Integration
- Appointments linked to contacts via `contact_id`
- Customer details populated from CRM contacts

### Workflow Integration
- Triggers: `appointment_created`, `appointment_cancelled`, `appointment_confirmed`
- Can trigger automation workflows

### Email/SMS Integration
- Reminder system ready for email/SMS integration
- `usePendingReminders()` hook for sending reminders

## Features by Component

### CalendarView
- Multi-view calendar (Month/Week/Day/Agenda)
- Mini calendar sidebar
- Calendar filtering
- Upcoming appointments list
- Quick appointment creation

### MonthView
- Full month grid
- Event indicators
- Today highlighting
- Click to navigate

### WeekView
- 7-day time grid
- Hourly slots
- Current time indicator
- Event duration display

### DayView
- Single day view
- Detailed event cards
- Time slot clicking

### AgendaView
- List-based agenda
- Grouped by date
- Event details
- Easy scanning

### AvailabilityEditor
- Weekly business hours
- Multiple time ranges per day
- Buffer time settings
- Minimum notice period
- Maximum booking window
- Timezone settings

### BookingPage
- Multi-step booking flow
- Date selection
- Time slot picker
- Customer details form
- Confirmation screen
- Responsive design

## Date Utilities

```typescript
import {
  formatDate,
  formatDateTime,
  formatTime,
  generateMonthGrid,
  generateTimeSlots,
  filterAvailableSlots,
} from '@/features/calendar/lib/utils';
```

## Styling

The calendar uses Tailwind CSS with:
- Color-coded calendars
- Status badges
- Hover effects
- Responsive design
- Dark mode support

## Future Enhancements

### Calendar Sync
- Google Calendar integration
- Outlook/Office 365 integration
- Two-way sync
- Conflict resolution

### Advanced Features
- Recurring appointments
- Appointment templates
- Group bookings
- Waiting lists
- Payment integration
- Video conferencing integration

### Analytics
- Appointment statistics
- Cancellation rates
- No-show tracking
- Revenue reports

## Permissions

All calendar features respect organization-level permissions via RLS policies:
- View: All org members
- Create/Update/Delete: All org members
- Owner-specific features: Settings

## Performance

- Optimized queries with indexes
- React Query caching
- Lazy-loaded views
- Efficient date calculations

## Testing

To test the calendar module:

1. Create a calendar
2. Set availability
3. Create appointment types
4. Book appointments via UI
5. Test public booking page
6. Verify reminders
7. Test cancellation/rescheduling

## Support

For issues or questions about the Calendar module, refer to:
- Database schema: `db/calendar_schema.sql`
- Types: `src/features/calendar/types.ts`
- Documentation: `docs/CALENDAR_MODULE.md`
