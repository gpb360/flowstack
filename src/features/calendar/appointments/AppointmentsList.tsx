import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, MapPin } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { DataTableUntitled } from '@/components/ui/data-table-untitled';
import { useAuth } from '@/context/AuthContext';
import { useAppointments, useCancelAppointment, useConfirmAppointment } from '../hooks/useAppointments';
import { NewAppointmentDialog } from '../calendar/NewAppointmentDialog';

const getBadgeVariant = (status: string): 'success' | 'error' | 'warning' | 'neutral' | 'info' => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'completed':
      return 'info';
    case 'scheduled':
    default:
      return 'neutral';
  }
};

export function AppointmentsList() {
  const { user } = useAuth();
  const organizationId = user?.user_metadata?.organization_id || '';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

  const { data: appointments, isLoading } = useAppointments({
    organizationId,
    search: search || undefined,
    status: statusFilter as any || undefined,
  });

  const cancelAppointment = useCancelAppointment();
  const confirmAppointment = useConfirmAppointment();

  const handleCancel = async (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await cancelAppointment.mutateAsync({
        appointmentId,
        organizationId,
      });
    }
  };

  const handleConfirm = async (appointmentId: string) => {
    await confirmAppointment.mutateAsync(appointmentId);
  };

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (row: any) => (
        <div className="font-medium">{row.title}</div>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customer_name',
      cell: (row: any) => (
        <div>
          <div className="font-medium">{row.customer_name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            {row.customer_email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {row.customer_email}
              </span>
            )}
            {row.customer_phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {row.customer_phone}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      accessorKey: 'start_time',
      cell: (row: any) => (
        <div>
          <div className="font-medium">{format(new Date(row.start_time), 'MMM d, yyyy')}</div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(row.start_time), 'h:mm a')} -{' '}
            {format(new Date(row.end_time), 'h:mm a')}
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessorKey: 'location',
      cell: (row: any) =>
        row.location ? (
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3 w-3" />
            {row.location}
          </div>
        ) : null,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => (
        <BadgeUntitled variant={getBadgeVariant(row.status)} size="sm">
          {row.status.replace('_', ' ')}
        </BadgeUntitled>
      ),
    },
    {
      header: 'Actions',
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ButtonUntitled variant="ghost" size="sm" isIconOnly>
              <MoreHorizontal className="h-4 w-4" />
            </ButtonUntitled>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {row.status === 'scheduled' && (
              <DropdownMenuItem onClick={() => handleConfirm(row.id)}>
                Confirm Appointment
              </DropdownMenuItem>
            )}
            {['scheduled', 'confirmed'].includes(row.status) && (
              <DropdownMenuItem
                onClick={() => handleCancel(row.id)}
                className="text-destructive"
              >
                Cancel Appointment
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Reschedule</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeaderUntitled
        title="Appointments"
        description="Manage your appointments and bookings"
        actions={
          <ButtonUntitled onClick={() => setIsNewAppointmentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </ButtonUntitled>
        }
      />

      {/* Filters */}
      <CardUntitled className="m-4">
        <div className="flex items-center gap-4 p-4">
          <InputUntitled
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="flex-1 max-w-sm"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ButtonUntitled variant="secondary">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {statusFilter && (
                  <BadgeUntitled variant="neutral" size="sm" className="ml-2">
                    {statusFilter}
                  </BadgeUntitled>
                )}
              </ButtonUntitled>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('')}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('scheduled')}>
                Scheduled
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('confirmed')}>
                Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardUntitled>

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <DataTableUntitled
          columns={columns}
          data={appointments || []}
          isLoading={isLoading}
        />
      </div>

      {/* New Appointment Dialog */}
      <NewAppointmentDialog
        open={isNewAppointmentOpen}
        onOpenChange={setIsNewAppointmentOpen}
      />
    </div>
  );
}
