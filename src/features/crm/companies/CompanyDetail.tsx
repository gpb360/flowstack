import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Globe, MapPin, Mail, Phone, Users, Plus, DollarSign, FileText } from 'lucide-react';
import { useCompany, useDeleteCompany, useCompanyContacts } from '../hooks/useCompanies';
import { useActivities } from '../hooks/useActivities';
import { useDeals } from '../hooks/useDeals';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { DataCard } from '@/components/ui/data-card';
import { Timeline } from '@/components/ui/timeline';
import { CompanyForm } from './CompanyForm';
import { ContactForm } from '../contacts/ContactForm';
import { EmptyStateUntitled } from '@/components/ui/empty-state-untitled';
import { formatDistanceToNow } from 'date-fns';

export const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  const { data: company, isLoading, error } = useCompany(id!);
  const { data: contacts } = useCompanyContacts(id!);
  const { data: activities } = useActivities({ companyId: id!, limit: 50 });
  const { data: dealsData } = useDeals({ companyId: id! });
  const deleteCompany = useDeleteCompany();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this company? This will also delete all associated contacts.')) {
      deleteCompany.mutate(id!, {
        onSuccess: () => {
          navigate('/crm/companies');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Loading company...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-danger">Company not found</div>
      </div>
    );
  }

  const deals = dealsData?.deals || [];
  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

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
            <ButtonUntitled variant="tertiary" size="sm" onClick={() => navigate('/crm/companies')} isIconOnly>
              <ArrowLeft size={18} />
            </ButtonUntitled>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-secondary/20 text-secondary flex items-center justify-center font-bold text-lg">
                {company.name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{company.name}</h1>
                {company.domain && (
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-text-secondary hover:text-primary flex items-center gap-1"
                  >
                    <Globe size={14} />
                    {company.domain}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ButtonUntitled variant="secondary" size="sm" onClick={() => setIsContactFormOpen(true)} leftIcon={<Plus size={16} />}>
              Add Contact
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
          {/* Company Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Domain */}
            {company.domain && (
              <DataCard
                icon={<Globe size={18} />}
                title="Website"
                content={
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {company.domain}
                  </a>
                }
              />
            )}

            {/* Address */}
            {company.address && (
              <DataCard
                icon={<MapPin size={18} />}
                title="Address"
                content={<span className="text-text-secondary">{company.address}</span>}
              />
            )}

            {/* Total Deal Value */}
            {deals.length > 0 && (
              <DataCard
                icon={<DollarSign size={18} />}
                title="Total Pipeline Value"
                content={
                  <span className="text-green-600 font-semibold">
                    ${totalValue.toLocaleString()}
                  </span>
                }
              />
            )}
          </div>

          {/* Contacts at this company */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                Contacts ({contacts?.length || 0})
              </h3>
            </div>

            {contacts && contacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contacts.map((contact) => (
                  <Link
                    key={contact.id}
                    to={`/crm/contacts/${contact.id}`}
                    className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {contact.first_name?.[0] || '?'}{contact.last_name?.[0] || ''}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {contact.first_name} {contact.last_name}
                      </p>
                      {contact.position && (
                        <p className="text-sm text-text-secondary">{contact.position}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-text-secondary hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail size={16} />
                        </a>
                      )}
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-text-secondary hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone size={16} />
                        </a>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyStateUntitled
                icon={<Users />}
                title="No contacts at this company yet"
                description="Add your first contact to start tracking relationships"
                action={
                  <ButtonUntitled variant="primary" size="md" onClick={() => setIsContactFormOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                    Add First Contact
                  </ButtonUntitled>
                }
              />
            )}
          </div>

          {/* Deals */}
          {deals.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Deals ({deals.length})</h3>
                <Link to="/crm/deals" className="text-primary text-sm hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deals.map((deal) => (
                  <Link
                    key={deal.id}
                    to={`/crm/deals/${deal.id}`}
                    className="block p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{deal.title}</h4>
                        {deal.stages && (
                          <p className="text-sm text-text-secondary">{deal.stages.name}</p>
                        )}
                        {deal.contacts && (
                          <p className="text-sm text-text-secondary mt-1">
                            {deal.contacts.first_name} {deal.contacts.last_name}
                          </p>
                        )}
                      </div>
                      {deal.value && (
                        <div className="flex items-center gap-1 text-green-600 font-semibold ml-4">
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
                <p className="text-sm">Log your first interaction with this company</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isFormOpen && (
        <CompanyForm
          company={company}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {/* Add Contact Form */}
      {isContactFormOpen && (
        <ContactForm
          onClose={() => setIsContactFormOpen(false)}
          defaultCompanyId={id}
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
