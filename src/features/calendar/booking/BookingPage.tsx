import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format, addDays, isSameDay } from 'date-fns';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { useAppointmentType } from '../hooks/useAvailability';
import { useAvailableSlots } from '../hooks/useAvailability';
import { createAppointment } from '../lib/booking';
import type { TimeSlot } from '../types';

export function BookingPage() {
  const { bookingPageId } = useParams<{ bookingPageId: string }>();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const { data: appointmentType, isLoading: isLoadingType } = useAppointmentType(
    bookingPageId || ''
  );

  const selectedCalendarId = appointmentType?.calendar_id || '';

  const { data: availableSlots = [], isLoading: isLoadingSlots } = useAvailableSlots(
    selectedDate
      ? {
          calendarId: selectedCalendarId,
          startDate: selectedDate,
          endDate: addDays(selectedDate, 0),
          duration: appointmentType?.duration_minutes || 60,
        }
      : { calendarId: '', startDate: new Date(), endDate: new Date() }
  );

  const dates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBooking = async () => {
    if (!selectedSlot || !customerInfo.name || !customerInfo.email) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get organization from calendar (simplified)
      const organizationId = ''; // Would come from calendar query

      await createAppointment({
        organizationId,
        calendar_id: selectedCalendarId,
        appointment_type_id: bookingPageId || '',
        title: appointmentType?.name || 'Appointment',
        description: appointmentType?.description,
        location: appointmentType?.location_details,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        duration_minutes: appointmentType?.duration_minutes || 60,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_notes: customerInfo.notes,
        status: 'scheduled',
        booking_source: 'widget',
      });

      setIsComplete(true);
      setStep(4);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <CardUntitled className="max-w-md w-full p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-text-secondary mb-4">
            Your appointment has been scheduled successfully.
          </p>
          <div className="bg-muted rounded-lg p-4 text-left mb-4">
            <div className="font-semibold">{appointmentType?.name}</div>
            <div className="text-sm text-text-secondary mt-1">
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="text-sm text-text-secondary">
              {selectedSlot && format(new Date(selectedSlot.start_time), 'h:mm a')} -{' '}
              {selectedSlot && format(new Date(selectedSlot.end_time), 'h:mm a')}
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            A confirmation email has been sent to {customerInfo.email}
          </p>
        </CardUntitled>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{appointmentType?.name}</h1>
          {appointmentType?.description && (
            <p className="text-text-secondary mb-4">{appointmentType.description}</p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-text-secondary">
            <BadgeUntitled variant="neutral" size="sm">
              <Clock className="mr-1 h-3 w-3" />
              {appointmentType?.duration_minutes} minutes
            </BadgeUntitled>
            <BadgeUntitled variant="neutral" size="sm">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {appointmentType?.location_type === 'video' ? 'Video Call' : 'In Person'}
            </BadgeUntitled>
            {(appointmentType?.price ?? 0) > 0 && (
              <BadgeUntitled variant="neutral" size="sm">${appointmentType?.price ?? 0}</BadgeUntitled>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      step >= s
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-white'
                        : 'border-border bg-background'
                    }`}
                  >
                    {s}
                  </div>
                  <div className="text-xs mt-2 text-text-secondary">
                    {s === 1 && 'Date'}
                    {s === 2 && 'Time'}
                    {s === 3 && 'Details'}
                  </div>
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      step > s ? 'bg-[#D4AF37]' : 'bg-border'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <CardUntitled className="p-6">
          {/* Step 1: Select Date */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select a Date</h2>
              <div className="grid grid-cols-7 gap-2">
                {dates.map((date) => {
                  const hasSlots = true; // Would check actual availability
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => hasSlots && handleDateSelect(date)}
                      disabled={!hasSlots}
                      className={`
                        p-3 rounded-lg border text-center transition-colors
                        ${hasSlots ? 'hover:border-[#D4AF37] cursor-pointer' : 'opacity-30 cursor-not-allowed'}
                        ${selectedDate && isSameDay(date, selectedDate) ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-border'}
                      `}
                    >
                      <div className="text-xs text-text-secondary uppercase">
                        {format(date, 'EEE')}
                      </div>
                      <div className="text-lg font-semibold">{format(date, 'd')}</div>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="mt-6 flex justify-end">
                  <ButtonUntitled onClick={() => setStep(2)}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ButtonUntitled>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Time */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <ButtonUntitled variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </ButtonUntitled>
                <h2 className="text-xl font-semibold">Select a Time</h2>
                <div className="w-20" />
              </div>

              <p className="text-text-secondary mb-4">
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>

              {isLoadingSlots ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto"></div>
                  <p className="text-sm text-text-secondary mt-2">Loading available times...</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!slot.available}
                      className={`
                        p-3 rounded-lg border text-center transition-colors
                        ${slot.available
                          ? 'hover:border-[#D4AF37] cursor-pointer'
                          : 'opacity-30 cursor-not-allowed bg-muted'
                        }
                        ${selectedSlot?.id === slot.id
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-border'
                        }
                      `}
                    >
                      {format(new Date(slot.start_time), 'h:mm a')}
                    </button>
                  ))}
                </div>
              )}

              {selectedSlot && (
                <div className="mt-6 flex justify-end">
                  <ButtonUntitled onClick={() => setStep(3)}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ButtonUntitled>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Customer Details */}
          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <ButtonUntitled variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </ButtonUntitled>
                <h2 className="text-xl font-semibold">Your Details</h2>
                <div className="w-20" />
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <InputUntitled
                  label="Name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />

                <InputUntitled
                  label="Email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                />

                <InputUntitled
                  label="Phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes (optional)</label>
                  <textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Any additional information..."
                    rows={3}
                    className="w-full rounded border border-gray-300 p-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                </div>

                <ButtonUntitled
                  onClick={handleBooking}
                  disabled={isSubmitting || !customerInfo.name || !customerInfo.email}
                  className="w-full"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </ButtonUntitled>
              </div>
            </div>
          )}
        </CardUntitled>
      </div>
    </div>
  );
}
