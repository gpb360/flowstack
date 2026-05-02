import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Globe, MapPin, Building2 } from 'lucide-react';
import { useCompanies, useDeleteCompany } from '../hooks/useCompanies';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { DataTableUntitled } from '@/components/ui/data-table-untitled';
import { EmptyStateUntitled } from '@/components/ui/empty-state-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { CompanyForm } from './CompanyForm';

export const CompaniesList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);

  const { data, isLoading, error } = useCompanies({
    search: search || undefined,
    pageSize: 100,
  });

  const deleteCompany = useDeleteCompany();

  const companies = data?.companies || [];

  const columns = [
    {
      key: 'name',
      label: 'Company',
      render: (company: any) => (
        <Link
          to={`/crm/companies/${company.id}`}
          className="flex items-center gap-3 font-medium text-text-primary hover:text-primary transition-colors"
        >
          <div className="w-8 h-8 rounded bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs">
            {company.name[0]}
          </div>
          <span>{company.name}</span>
        </Link>
      ),
    },
    {
      key: 'domain',
      label: 'Website',
      render: (company: any) =>
        company.domain ? (
          <a
            href={`https://${company.domain}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-text-secondary hover:text-primary"
          >
            <Globe size={14} />
            {company.domain}
          </a>
        ) : (
          '-'
        ),
    },
    {
      key: 'address',
      label: 'Location',
      render: (company: any) =>
        company.address ? (
          <span className="flex items-center gap-2 text-text-secondary">
            <MapPin size={14} />
            {company.address}
          </span>
        ) : (
          '-'
        ),
    },
    {
      key: 'contacts',
      label: 'Contacts',
      render: (company: any) => {
        // This would need to be fetched from a separate query
        return <span className="text-text-secondary">-</span>;
      },
    },
    {
      key: 'actions',
      label: '',
      render: (company: any) => (
        <div className="flex items-center gap-2">
          <ButtonUntitled
            variant="tertiary"
            size="sm"
            onClick={() => {
              setEditingCompany(company);
              setIsFormOpen(true);
            }}
          >
            Edit
          </ButtonUntitled>
          <ButtonUntitled
            variant="tertiary"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to delete this company?')) {
                deleteCompany.mutate(company.id);
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
        title="Companies"
        description="Manage your customer companies"
        icon={Building2}
        actions={
          <ButtonUntitled variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsFormOpen(true)}>
            Add Company
          </ButtonUntitled>
        }
      />

      {/* Search */}
      <div className="px-6 py-4 border-b border-border bg-surface">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-text-muted">Loading companies...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-danger">Error loading companies</div>
          </div>
        ) : companies.length === 0 ? (
          <EmptyStateUntitled
            icon={<Building2 />}
            title="No companies found"
            description={search ? 'Try adjusting your search' : 'Create your first company'}
            action={
              !search ? (
                <ButtonUntitled variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsFormOpen(true)}>
                  Add Company
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
            data={companies}
            getRowId={(company) => company.id}
            onRowClick={(company) => window.location.href = `/crm/companies/${company.id}`}
          />
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <CompanyForm
          company={editingCompany}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCompany(null);
          }}
        />
      )}
    </div>
  );
};
