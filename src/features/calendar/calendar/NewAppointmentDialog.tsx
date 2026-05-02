// @ts-nocheck
import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useCalendars } from '../hooks/useCalendars';
import { useAppointmentTypes } from '../hooks/useAvailability';
import { useCreateAppointment } from '../hooks/useAppointments';
import { useContacts } from '@/features/crm/hooks/useContacts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  calendarId?: string;
}

export function NewAppointmentDialog({
  open,
  onOpenChange,
  defaultDate = new Date(),
  calendarId,
}: NewAppointmentDialogProps) {
  const { user } = useAuth();
  const organizationId = user?.user_metadata?.organization_id || '';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    contactId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    calendarId: calendarId || '',
    appointmentTypeId: '',
    startTime: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
    duration: 60,
    notes: '',
  });

  const { data: calendars } = useCalendars(organizationId);
  const { data: appointmentTypes } = useAppointmentTypes(
    organizationId,
    formData.calendarId
  );
  const { data: contacts } = useContacts(organizationId);
  const createAppointment = useCreateAppointment();

  const handleSubmit = async () => {
    try {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(startTime.getTime() + formData.duration * 60000);

      await createAppointment.mutateAsync({
        organizationId,
        calendar_id: formData.calendarId || null,
        appointment_type_id: formData.appointmentTypeId || null,
        contact_id: formData.contactId || null,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: formData.duration,
        customer_name: formData.customerName || (contacts?.find((c) => c.id === formData.contactId)
          ? `${contacts.find((c) => c.id === formData.contactId)!.first_name || ''} ${contacts.find((c) => c.id === formData.contactId)!.last_name || ''}`.trim()
          : ''),
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        internal_notes: formData.notes,
        status: 'scheduled',
        booking_source: 'manual',
      });

      onOpenChange(false);
      setStep(1);
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        contactId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        calendarId: calendarId || '',
        appointmentTypeId: '',
        startTime: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
        duration: 60,
        notes: '',
      });
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>

        <Tabs value={String(step)} onValueChange={(v) => setStep(Number(v))}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1">Basic Info</TabsTrigger>
            <TabsTrigger value="2">Time & Details</TabsTrigger>
            <TabsTrigger value="3">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="space-y-4 mt-4">
            {/* Calendar Selection */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Calendar</div>
              <Select
                value={formData.calendarId}
                onValueChange={(value) => updateField('calendarId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  {calendars?.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: calendar.color }}
                        />
                        {calendar.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <InputUntitled
              label="Title *"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Appointment title"
              required
            />

            {/* Appointment Type */}
            {appointmentTypes && appointmentTypes.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Type</div>
                <Select
                  value={formData.appointmentTypeId}
                  onValueChange={(value) => {
                    updateField('appointmentTypeId', value);
                    const type = appointmentTypes.find((t) => t.id === value);
                    if (type) {
                      updateField('duration', type.duration_minutes);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} ({type.duration_minutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Description</div>
              <Textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Appointment description"
                rows={3}
                className="w-full rounded border border-gray-300 p-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              />
            </div>
          </TabsContent>

          <TabsContent value="2" className="space-y-4 mt-4">
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <InputUntitled
                  label="Date & Time"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => updateField('startTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Duration (minutes)</div>
                <Select
                  value={String(formData.duration)}
                  onValueChange={(value) => updateField('duration', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <InputUntitled
                label="Location"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Add location or meeting link"
              />
            </div>

            {/* Internal Notes */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Internal Notes</div>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Notes for internal use only"
                rows={3}
                className="w-full rounded border border-gray-300 p-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              />
            </div>
          </TabsContent>

          <TabsContent value="3" className="space-y-4 mt-4">
            {/* Link to Contact */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Link to Contact</div>
              <Select
                value={formData.contactId}
                onValueChange={(value) => {
                  updateField('contactId', value);
                  const contact = contacts?.find((c) => c.id === value);
                  if (contact) {
                    updateField('customerName', `${contact.first_name || ''} ${contact.last_name || ''}`.trim());
                    updateField('customerEmail', contact.email || '');
                    updateField('customerPhone', contact.phone || '');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {contacts?.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                      {contact.email && ` (${contact.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Or Manual Entry */}
            <div className="border-t pt-4">
              <p className="text-sm text-text-secondary mb-4">
                Or enter customer details manually
              </p>

              <div className="space-y-4">
                <InputUntitled
                  label="Customer Name"
                  value={formData.customerName}
                  onChange={(e) => updateField('customerName', e.target.value)}
                  placeholder="Full name"
                  required
                />

                <InputUntitled
                  label="Email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => updateField('customerEmail', e.target.value)}
                  placeholder="customer@example.com"
                />

                <InputUntitled
                  label="Phone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => updateField('customerPhone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <ButtonUntitled variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </ButtonUntitled>
          {step > 1 && (
            <ButtonUntitled variant="secondary" onClick={() => setStep((prev) => prev - 1)}>
              Previous
            </ButtonUntitled>
          )}
          {step < 3 ? (
            <ButtonUntitled onClick={() => setStep((prev) => prev + 1)}>
              Next
            </ButtonUntitled>
          ) : (
            <ButtonUntitled onClick={handleSubmit} disabled={createAppointment.isPending || !formData.title || !formData.customerName}>
              {createAppointment.isPending ? 'Creating...' : 'Create Appointment'}
            </ButtonUntitled>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
