import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateCompany, useUpdateCompany } from '../hooks/useCompanies';
import type { Database } from '@/types/database.types';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';

type Company = Database['public']['Tables']['companies']['Row'] & Record<string, any>;

interface CompanyFormProps {
  company?: Company;
  onClose: () => void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({ company, onClose }) => {
  const isEditing = !!company;

  const [formData, setFormData] = useState({
    name: company?.name || '',
    domain: company?.domain || '',
    address: company?.address || '',
  });

  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateCompany.mutateAsync({
          companyId: company.id,
          updates: formData,
        });
      } else {
        await createCompany.mutateAsync(formData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg w-full max-w-lg shadow-2xl">
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Company' : 'New Company'}</h2>
          <ButtonUntitled variant="tertiary" size="sm" onClick={onClose} isIconOnly>
            <X size={18} />
          </ButtonUntitled>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <InputUntitled
            id="name"
            label="Company Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Acme Corporation"
            required
          />

          {/* Domain */}
          <InputUntitled
            id="domain"
            label="Website Domain"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="acme.com"
          />

          {/* Address */}
          <InputUntitled
            id="address"
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main St, City, State, ZIP"
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <ButtonUntitled variant="secondary" onClick={onClose}>
              Cancel
            </ButtonUntitled>
            <ButtonUntitled
              variant="primary"
              type="submit"
              isLoading={createCompany.isPending || updateCompany.isPending}
            >
              {createCompany.isPending || updateCompany.isPending
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Create Company'}
            </ButtonUntitled>
          </div>
        </form>
      </div>
    </div>
  );
};
