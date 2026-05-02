import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreateContact, useUpdateContact } from '../hooks/useContacts';
import { useTags } from '../hooks/useActivities';
import { useCompanies } from '../hooks/useCompanies';
import type { Database } from '@/types/database.types';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';

type Contact = Database['public']['Tables']['contacts']['Row'] & Record<string, any>;

interface ContactFormProps {
  contact?: Contact;
  onClose: () => void;
  defaultCompanyId?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ contact, onClose, defaultCompanyId }) => {
  const isEditing = !!contact;

  const [formData, setFormData] = useState({
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    position: contact?.position || '',
    company_id: contact?.company_id || defaultCompanyId || '',
    owner_id: contact?.owner_id || '',
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const { data: tags } = useTags();
  const { data: companies } = useCompanies({ pageSize: 100 });

  useEffect(() => {
    // Fetch contact tags if editing
    if (contact) {
      // TODO: Fetch and set selected tags
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateContact.mutateAsync({
          contactId: contact.id,
          updates: formData,
        });
      } else {
        const newContact = await createContact.mutateAsync(formData);

        // Add tags if selected
        if (selectedTags.length > 0) {
          // TODO: Implement tag adding
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Contact' : 'New Contact'}</h2>
          <ButtonUntitled variant="tertiary" size="sm" onClick={onClose} isIconOnly>
            <X size={18} />
          </ButtonUntitled>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <InputUntitled
              id="first_name"
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <InputUntitled
              id="last_name"
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>

          {/* Email */}
          <InputUntitled
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />

          {/* Phone */}
          <InputUntitled
            id="phone"
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />

          {/* Position */}
          <InputUntitled
            id="position"
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="CEO, Manager, etc."
          />

          {/* Company */}
          <div>
            <label htmlFor="company_id" className="block text-sm font-medium text-text-secondary mb-1.5">
              Company
            </label>
            <select
              id="company_id"
              value={formData.company_id}
              onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">No company</option>
              {companies?.companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-text-secondary mb-1.5">
              Tags
            </label>
            <div className="border border-border rounded-lg p-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tagId) => {
                  const tag = tags?.find((t) => t.id === tagId);
                  return tag ? (
                    <span
                      key={tagId}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => setSelectedTags(selectedTags.filter((id) => id !== tagId))}
                        className="hover:opacity-80"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value && !selectedTags.includes(e.target.value)) {
                    setSelectedTags([...selectedTags, e.target.value]);
                  }
                }}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Add a tag...</option>
                {tags?.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <ButtonUntitled variant="secondary" onClick={onClose}>
              Cancel
            </ButtonUntitled>
            <ButtonUntitled
              variant="primary"
              type="submit"
              isLoading={createContact.isPending || updateContact.isPending}
            >
              {createContact.isPending || updateContact.isPending
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Create Contact'}
            </ButtonUntitled>
          </div>
        </form>
      </div>
    </div>
  );
};
