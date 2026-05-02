import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useImportContacts } from '../hooks/useContacts';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { AlertUntitled } from '@/components/ui/alert-untitled';

interface ContactImportProps {
  onClose: () => void;
}

export const ContactImport: React.FC<ContactImportProps> = ({ onClose }) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'confirm'>('upload');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importContacts = useImportContacts();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());

        if (lines.length < 2) {
          setErrors(['CSV file must have at least a header row and one data row']);
          return;
        }

        // Parse headers
        const headerRow = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
        setHeaders(headerRow);

        // Parse data
        const data = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
          const row: any = {};
          headerRow.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        setCsvData(data);
        setStep('mapping');
      } catch (err) {
        setErrors(['Failed to parse CSV file']);
      }
    };

    reader.readAsText(file);
  };

  const handleMapping = () => {
    setStep('confirm');
  };

  const handleConfirm = async () => {
    try {
      // Map CSV data to contact fields
      const contacts = csvData.map((row) => {
        const contact: any = {
          first_name: mapping.first_name ? row[mapping.first_name] || '' : '',
          last_name: mapping.last_name ? row[mapping.last_name] || '' : '',
          email: mapping.email ? row[mapping.email] || null : null,
          phone: mapping.phone ? row[mapping.phone] || null : null,
          position: mapping.position ? row[mapping.position] || null : null,
        };

        // Only include non-null values
        Object.keys(contact).forEach((key) => {
          if (contact[key] === null || contact[key] === '') {
            delete contact[key];
          }
        });

        return contact;
      });

      // Filter out empty contacts (must have at least a name or email)
      const validContacts = contacts.filter(
        (c) => c.first_name || c.last_name || c.email
      );

      await importContacts.mutateAsync(validContacts);

      // Close after successful import
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrors(['Failed to import contacts']);
    }
  };

  const availableFields = [
    { key: 'first_name', label: 'First Name', required: true },
    { key: 'last_name', label: 'Last Name', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'position', label: 'Position', required: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Import Contacts</h2>
          <ButtonUntitled variant="tertiary" size="sm" onClick={onClose} isIconOnly>
            <X size={18} />
          </ButtonUntitled>
        </div>

        <div className="p-6">
          {errors.length > 0 && (
            <AlertUntitled variant="error" className="mb-4">
              <AlertCircle size={18} />
              {errors[0]}
            </AlertUntitled>
          )}

          {importContacts.isSuccess && (
            <AlertUntitled variant="success" className="mb-4">
              <CheckCircle2 size={18} />
              Successfully imported {csvData.length} contacts!
            </AlertUntitled>
          )}

          {step === 'upload' && (
            <div className="space-y-4">
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <FileSpreadsheet size={48} className="mx-auto mb-4 text-text-muted" />
                <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
                <p className="text-text-secondary mb-4">
                  Upload a CSV file with your contacts data
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <ButtonUntitled variant="primary" onClick={() => fileInputRef.current?.click()} leftIcon={<Upload className="w-4 h-4" />}>
                  Choose File
                </ButtonUntitled>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">CSV Format Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• First row should contain column headers</li>
                  <li>• Include columns for: First Name, Last Name, Email, Phone, Position</li>
                  <li>• Use commas to separate values</li>
                  <li>• Optional: Wrap text values in quotes</li>
                </ul>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Map CSV Columns to Contact Fields</h3>
                <p className="text-text-secondary mb-4">
                  Match your CSV columns to the corresponding contact fields
                </p>
              </div>

              <div className="space-y-3">
                {availableFields.map((field) => (
                  <div key={field.key} className="grid grid-cols-2 gap-4 items-center">
                    <label className="text-sm font-medium text-text-secondary">
                      {field.label}
                      {field.required && <span className="text-error ml-1">*</span>}
                    </label>
                    <select
                      value={mapping[field.key] || ''}
                      onChange={(e) =>
                        setMapping({ ...mapping, [field.key]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">-- Select Column --</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <ButtonUntitled variant="secondary" onClick={() => setStep('upload')}>
                  Back
                </ButtonUntitled>
                <ButtonUntitled variant="primary" onClick={handleMapping}>
                  Next
                </ButtonUntitled>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to Import</h3>
                <p className="text-text-secondary">
                  {csvData.length} contacts will be imported
                </p>
              </div>

              <div className="border border-border rounded-lg overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="bg-surface-hover sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-semibold">Name</th>
                      <th className="p-3 text-left font-semibold">Email</th>
                      <th className="p-3 text-left font-semibold">Phone</th>
                      <th className="p-3 text-left font-semibold">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {csvData.slice(0, 10).map((row, index) => {
                      const firstName = mapping.first_name ? row[mapping.first_name] : '';
                      const lastName = mapping.last_name ? row[mapping.last_name] : '';
                      return (
                        <tr key={index} className="hover:bg-surface-hover">
                          <td className="p-3">
                            {firstName} {lastName}
                          </td>
                          <td className="p-3">{mapping.email ? row[mapping.email] : '-'}</td>
                          <td className="p-3">{mapping.phone ? row[mapping.phone] : '-'}</td>
                          <td className="p-3">
                            {mapping.position ? row[mapping.position] : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {csvData.length > 10 && (
                  <div className="p-3 text-center text-text-muted text-sm">
                    ... and {csvData.length - 10} more
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <ButtonUntitled variant="secondary" onClick={() => setStep('mapping')}>
                  Back
                </ButtonUntitled>
                <ButtonUntitled
                  variant="primary"
                  onClick={handleConfirm}
                  isLoading={importContacts.isPending}
                >
                  {importContacts.isPending ? 'Importing...' : 'Import Contacts'}
                </ButtonUntitled>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
