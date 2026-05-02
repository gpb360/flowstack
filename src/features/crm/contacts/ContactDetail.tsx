import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Edit, Trash2, FileText, DollarSign } from 'lucide-react';
import { useContact, useDeleteContact, useContactTags, useCalculateLeadScore } from '../hooks/useContacts';
import { useActivities, useLogNote } from '../hooks/useActivities';
import { useCompanyContacts } from '../hooks/useCompanies';
import { useDeals } from '../hooks/useDeals';
import { useAuth } from '@/context/AuthContext';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { DataCard } from '@/components/ui/data-card';
import { Timeline } from '@/components/ui/timeline';
import { ContactForm } from './ContactForm';
import { mapLeadGradeToVariant } from '../lib/badge-variants';
import { formatDistanceToNow } from 'date-fns';

export const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: contact, isLoading, error } = useContact(id!);
  const { data: tags } = useContactTags(id!);
  const { data: activities } = useActivities({ contactId: id!, limit: 50 });
  const { data: deals } = useDeals({ contactId: id! });
  const deleteContact = useDeleteContact();

  const calculateScore = useCalculateLeadScore();
  const [leadScore, setLeadScore] = useState<any>(null);

  // Fetch company contacts if contact has a company
  const { data: companyContacts } = useCompanyContacts(contact?.company_id || '');

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this contact?')) {
      deleteContact.mutate(id!, {
        onSuccess: () => {
          navigate('/crm/contacts');
        },
      });
    }
  };

  const handleCalculateScore = async () => {
    if (!contact) return;

    const score = await calculateScore.mutateAsync({
      contact,
      company: contact.companies || undefined,
      activities: activities || [],
      deals: deals?.deals || [],
    });

    setLeadScore(score);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Loading contact...</div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-danger">Contact not found</div>
      </div>
    );
  }

  const timelineItems = (activities || []).map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    timestamp: new Date(activity.created_at),
    type: activity.type,
    icon: getActivityIcon(activity.type),
  }));

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ButtonUntitled variant="tertiary" size="sm" onClick={() => navigate('/crm/contacts')} isIconOnly>
              <ArrowLeft size={18} />
            </ButtonUntitled>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                {contact.first_name?.[0] || '?'}{contact.last_name?.[0] || ''}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {contact.first_name} {contact.last_name}
                </h1>
                {contact.position && (
                  <p className="text-text-secondary text-sm">{contact.position}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {leadScore && (
              <BadgeUntitled variant={mapLeadGradeToVariant(leadScore.grade)}>
                Score: {leadScore.score}/100 ({leadScore.grade})
              </BadgeUntitled>
            )}
            <ButtonUntitled variant="secondary" size="sm" onClick={handleCalculateScore}>
              Calculate Score
            </ButtonUntitled>
            <ButtonUntitled variant="secondary" size="sm" onClick={() => setIsFormOpen(true)} leftIcon={<Edit size={16} />}>
              Edit
            </ButtonUntitled>
            <ButtonUntitled variant="tertiary" size="sm" onClick={handleDelete} leftIcon={<Trash2 size={16} />}>
              Delete
            </ButtonUntitled>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Email */}
            <DataCard
              icon={<Mail size={18} />}
              title="Email"
              content={
                contact.email ? (
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-primary hover:underline"
                  >
                    {contact.email}
                  </a>
                ) : (
                  '-'
                )
              }
            />

            {/* Phone */}
            <DataCard
              icon={<Phone size={18} />}
              title="Phone"
              content={
                contact.phone ? (
                  <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                    {contact.phone}
                  </a>
                ) : (
                  '-'
                )
              }
            />

            {/* Company */}
            <DataCard
              icon={<Building2 size={18} />}
              title="Company"
              content={
                contact.companies ? (
                  <Link
                    to={`/crm/companies/${contact.companies.id}`}
                    className="text-primary hover:underline"
                  >
                    {contact.companies.name}
                  </Link>
                ) : (
                  '-'
                )
              }
            />
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <BadgeUntitled
                    key={tag.id}
                    variant="primary"
                    className="text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </BadgeUntitled>
                ))}
              </div>
            </div>
          )}

          {/* Associated Deals */}
          {deals && deals.deals.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Deals</h3>
                <Link to="/crm/deals" className="text-primary text-sm hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deals.deals.map((deal) => (
                  <Link
                    key={deal.id}
                    to={`/crm/deals/${deal.id}`}
                    className="block p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{deal.title}</h4>
                        {deal.stages && (
                          <p className="text-sm text-text-secondary">{deal.stages.name}</p>
                        )}
                      </div>
                      {deal.value && (
                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                          <DollarSign size={16} />
                          {deal.value.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Company Contacts */}
          {companyContacts && companyContacts.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Other Contacts at {contact.companies?.name}</h3>
              <div className="space-y-2">
                {companyContacts
                  .filter((c) => c.id !== contact.id)
                  .slice(0, 5)
                  .map((c) => (
                    <Link
                      key={c.id}
                      to={`/crm/contacts/${c.id}`}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {c.first_name?.[0] || '?'}{c.last_name?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-medium">
                          {c.first_name} {c.last_name}
                        </p>
                        {c.position && (
                          <p className="text-sm text-text-secondary">{c.position}</p>
                        )}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Activity Timeline</h3>
              <ButtonUntitled variant="secondary" size="sm" leftIcon={<FileText size={16} />}>
                Log Activity
              </ButtonUntitled>
            </div>

            {timelineItems.length > 0 ? (
              <Timeline items={timelineItems} />
            ) : (
              <div className="text-center py-12 text-text-muted">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No activity yet</p>
                <p className="text-sm">Log your first interaction with this contact</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isFormOpen && (
        <ContactForm
          contact={contact}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

function getActivityIcon(type: string) {
  switch (type) {
    case 'note':
      return '📝';
    case 'email_sent':
    case 'email_received':
      return '📧';
    case 'call':
      return '📞';
    case 'meeting':
      return '📅';
    case 'task':
      return '✅';
    case 'deal_stage_change':
      return '💼';
    default:
      return '📌';
  }
}
