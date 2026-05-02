import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { useAuth } from '../../context/AuthContext';

type Contact = Database['public']['Tables']['contacts']['Row'] & Record<string, any>;

export const ContactList: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ first_name: '', last_name: '', email: '', phone: '', position: '' });

  useEffect(() => {
    if (currentOrganization) {
      fetchContacts();
    }
  }, [currentOrganization]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          organization_id: currentOrganization.id,
          ...newContact
        } as any)
        .select()
        .single();

      if (error) throw error;
      setContacts([data, ...contacts]);
      setIsModalOpen(false);
      setNewContact({ first_name: '', last_name: '', email: '', phone: '', position: '' });
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      setContacts(contacts.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
        <h3 className="text-lg font-semibold">All Contacts</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded transition-colors text-sm font-medium flex items-center gap-2"
        >
          <span>+</span> Add Contact
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-text-muted">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <span className="text-4xl mb-4">👥</span>
            <p>No contacts found.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-primary hover:underline mt-2">Create your first contact</button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-hover sticky top-0">
              <tr>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Phone</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Position</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contacts.map(contact => (
                <tr key={contact.id} className="hover:bg-surface-hover/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {contact.first_name?.[0] || '?'}{contact.last_name?.[0] || ''}
                      </div>
                      <span className="font-medium text-text-primary">
                        {contact.first_name} {contact.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-text-secondary">{contact.email}</td>
                  <td className="p-4 text-text-secondary">{contact.phone}</td>
                  <td className="p-4 text-text-secondary">{contact.position}</td>
                  <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(contact.id)}
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
            <h3 className="text-xl font-bold mb-4">Add New Contact</h3>
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">First Name</label>
                  <input 
                    className="w-full p-2 rounded bg-background border border-border text-text-primary focus:border-primary outline-none"
                    value={newContact.first_name}
                    onChange={e => setNewContact({...newContact, first_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Last Name</label>
                  <input 
                    className="w-full p-2 rounded bg-background border border-border text-text-primary focus:border-primary outline-none"
                    value={newContact.last_name}
                    onChange={e => setNewContact({...newContact, last_name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Email</label>
                <input 
                  type="email"
                  className="w-full p-2 rounded bg-background border border-border text-text-primary focus:border-primary outline-none"
                  value={newContact.email}
                  onChange={e => setNewContact({...newContact, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Phone</label>
                <input 
                  type="tel"
                  className="w-full p-2 rounded bg-background border border-border text-text-primary focus:border-primary outline-none"
                  value={newContact.phone}
                  onChange={e => setNewContact({...newContact, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Position</label>
                <input 
                  className="w-full p-2 rounded bg-background border border-border text-text-primary focus:border-primary outline-none"
                  value={newContact.position}
                  onChange={e => setNewContact({...newContact, position: e.target.value})}
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
                  Create Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
