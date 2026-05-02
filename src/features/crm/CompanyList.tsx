import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { useAuth } from '../../context/AuthContext';

type Company = Database['public']['Tables']['companies']['Row'] & Record<string, any>;

export const CompanyList: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', domain: '', address: '' });

  useEffect(() => {
    if (currentOrganization) {
      fetchCompanies();
    }
  }, [currentOrganization]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          organization_id: currentOrganization.id,
          ...newCompany
        } as any)
        .select()
        .single();

      if (error) throw error;
      setCompanies([data, ...companies]);
      setIsModalOpen(false);
      setNewCompany({ name: '', domain: '', address: '' });
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
      setCompanies(companies.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
        <h3 className="text-lg font-semibold">All Companies</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded transition-colors text-sm font-medium flex items-center gap-2"
        >
          <span>+</span> Add Company
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-text-muted">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <span className="text-4xl mb-4">🏢</span>
            <p>No companies found.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-primary hover:underline mt-2">Create your first company</button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-hover sticky top-0">
              <tr>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Domain</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Address</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {companies.map(company => (
                <tr key={company.id} className="hover:bg-surface-hover/50 transition-colors group">
                  <td className="p-4 font-medium text-text-primary">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs">
                          {company.name[0]}
                       </div>
                       {company.name}
                    </div>
                  </td>
                  <td className="p-4 text-text-secondary">
                    {company.domain ? (
                      <a href={`https://${company.domain}`} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">
                        {company.domain}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-text-secondary truncate max-w-xs">{company.address || '-'}</td>
                  <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(company.id)}
                      className="text-danger hover:text-danger/80 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border p-6 rounded-lg w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add New Company</h3>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Company Name</label>
                <input 
                  className="w-full p-2 rounded bg-background border border-border text-text-primary focus:border-primary outline-none"
                  value={newCompany.name}
                  onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Domain</label>
                <input 
                  className="w-full p-2 rounded bg-background border border-border text-text-primary focus:border-primary outline-none"
                  placeholder="acme.com"
                  value={newCompany.domain}
                  onChange={e => setNewCompany({...newCompany, domain: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Address</label>
                <input 
                  className="w-full p-2 rounded bg-background border border-border text-text-primary focus:border-primary outline-none"
                  value={newCompany.address}
                  onChange={e => setNewCompany({...newCompany, address: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 hover:bg-surface-hover rounded text-text-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded font-medium"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
