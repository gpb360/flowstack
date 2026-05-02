import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Mail, Phone, Users } from 'lucide-react';
import { useContacts, useDeleteContact } from '../hooks/useContacts';
import { useTags } from '../hooks/useActivities';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { DataTableUntitled } from '@/components/ui/data-table-untitled';
import { EmptyStateUntitled } from '@/components/ui/empty-state-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { ContactForm } from './ContactForm';

export const ContactsList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  const { data, isLoading, error } = useContacts({
    search: search || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    pageSize: 100,
  });

  const { data: tags } = useTags();
  const deleteContact = useDeleteContact();

  const contacts = data?.contacts || [];

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (contact: any) => (
        <Link
          to={`/crm/contacts/${contact.id}`}
          className="flex items-center gap-3 font-medium text-text-primary hover:text-primary transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
            {contact.first_name?.[0] || '?'}{contact.last_name?.[0] || ''}
          </div>
          <span>
            {contact.first_name} {contact.last_name}
          </span>
        </Link>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (contact: any) => (
        <a
          href={`mailto:${contact.email}`}
          className="text-text-secondary hover:text-primary flex items-center gap-2"
        >
          <Mail size={14} />
          {contact.email || '-'}
        </a>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (contact: any) => (
        <a
          href={`tel:${contact.phone}`}
          className="text-text-secondary hover:text-primary flex items-center gap-2"
        >
          <Phone size={14} />
          {contact.phone || '-'}
        </a>
      ),
    },
    {
      key: 'company',
      label: 'Company',
      render: (contact: any) =>
        contact.companies ? (
          <Link
            to={`/crm/companies/${contact.companies.id}`}
            className="flex items-center gap-2 text-text-secondary hover:text-primary"
          >
            <Users size={14} />
            {contact.companies.name}
          </Link>
        ) : (
          '-'
        ),
    },
    {
      key: 'position',
      label: 'Position',
      render: (contact: any) => <span className="text-text-secondary">{contact.position || '-'}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (contact: any) => (
        <div className="flex items-center gap-2">
          <ButtonUntitled
            variant="tertiary"
            size="sm"
            onClick={() => {
              setEditingContact(contact);
              setIsFormOpen(true);
            }}
          >
            Edit
          </ButtonUntitled>
          <ButtonUntitled
            variant="tertiary"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to delete this contact?')) {
                deleteContact.mutate(contact.id);
              }
            }}
          >
            Delete
          </ButtonUntitled>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeaderUntitled
        title="Contacts"
        description="Manage your customer relationships"
        icon={Users}
        actions={
          <ButtonUntitled variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsFormOpen(true)}>
            Add Contact
          </ButtonUntitled>
        }
      />

      {/* Filters */}
      <div className="px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {tags && tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-text-muted" />
              <select
                multiple
                value={selectedTags}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, (option) => option.value);
                  setSelectedTags(values);
                }}
                className="border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedTags.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-text-muted">Active filters:</span>
            {selectedTags.map((tagId) => {
              const tag = tags?.find((t) => t.id === tagId);
              return tag ? (
                <BadgeUntitled
                  key={tagId}
                  variant="primary"
                >
                  {tag.name}
                  <button
                    onClick={() => setSelectedTags(selectedTags.filter((id) => id !== tagId))}
                    className="ml-1 hover:text-text-primary"
                  >
                    ×
                  </button>
                </BadgeUntitled>
              ) : null;
            })}
            <button
              onClick={() => setSelectedTags([])}
              className="text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-text-muted">Loading contacts...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-danger">Error loading contacts</div>
          </div>
        ) : contacts.length === 0 ? (
          <EmptyStateUntitled
            icon={<Users />}
            title="No contacts found"
            description={search || selectedTags.length > 0 ? 'Try adjusting your filters' : 'Create your first contact'}
            action={
              !search && selectedTags.length === 0 ? (
                <ButtonUntitled variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsFormOpen(true)}>
                  Add Contact
                </ButtonUntitled>
              ) : null
            }
          />
        ) : (
          <DataTableUntitled
            columns={columns.map(col => ({
              ...col,
              id: col.key,
              accessorKey: col.key,
              header: col.label,
              cell: col.render ? (props: { row: any; value: unknown }) => col.render(props) : undefined,
            }))}
            data={contacts}
            getRowId={(contact) => contact.id}
            onRowClick={(contact) => window.location.href = `/crm/contacts/${contact.id}`}
          />
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <ContactForm
          contact={editingContact}
          onClose={() => {
            setIsFormOpen(false);
            setEditingContact(null);
          }}
        />
      )}
    </div>
  );
};
