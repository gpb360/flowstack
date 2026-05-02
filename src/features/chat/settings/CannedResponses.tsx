// @ts-nocheck
/**
 * Canned Responses Component
 * Manage pre-written responses for quick replies
 */

import { useState } from 'react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { TextareaUntitled } from '@/components/ui/textarea-untitled';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useChatCannedResponses } from '../hooks/useChatMessages';
import type { ChatCannedResponse, CannedResponseFormData } from '../types';

interface CannedResponsesProps {
  organizationId: string;
}

export function CannedResponses({ organizationId }: CannedResponsesProps) {
  const { responses, createResponse, updateResponse, deleteResponse, useResponse } =
    useChatCannedResponses(organizationId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<ChatCannedResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState<CannedResponseFormData>({
    name: '',
    content: '',
    category: '',
    tags: [],
    shortcuts: [],
  });

  const categories = Array.from(
    new Set(responses.map((r) => r.category).filter(Boolean))
  );

  const filteredResponses = responses.filter((response) => {
    const matchesSearch =
      !searchQuery ||
      response.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || response.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async () => {
    if (editingResponse) {
      await updateResponse({
        responseId: editingResponse.id,
        updates: formData,
      });
    } else {
      await createResponse({
        ...formData,
        organization_id: organizationId,
      });
    }

    setIsDialogOpen(false);
    setEditingResponse(null);
    setFormData({
      name: '',
      content: '',
      category: '',
      tags: [],
      shortcuts: [],
    });
  };

  const handleEdit = (response: ChatCannedResponse) => {
    setEditingResponse(response);
    setFormData({
      name: response.name,
      content: response.content,
      category: response.category || '',
      tags: response.tags || [],
      shortcuts: response.shortcuts || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (responseId: string) => {
    if (confirm('Are you sure you want to delete this canned response?')) {
      await deleteResponse(responseId);
    }
  };

  const handleUseResponse = async (responseId: string) => {
    await useResponse(responseId);
  };

  return (
    <div className="space-y-6 rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Canned Responses</h2>
          <p className="text-sm text-gray-600">
            Quick replies for common questions
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <ButtonUntitled onClick={() => setEditingResponse(null)}>
              <Plus className="mr-2 h-4 w-4" />
              New Response
            </ButtonUntitled>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingResponse ? 'Edit Response' : 'New Response'}
              </DialogTitle>
              <DialogDescription>
                Create a pre-written response for quick replies
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name">Name</label>
                <InputUntitled
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Greeting, Pricing Inquiry"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content">Response</label>
                <TextareaUntitled
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={6}
                  placeholder="Type your response here..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category">Category (optional)</label>
                <InputUntitled
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Greetings, Support, Sales"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <InputUntitled
                  id="tags"
                  value={formData.tags?.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g., common, urgent, sales"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="shortcuts">Shortcuts (comma-separated)</label>
                <InputUntitled
                  id="shortcuts"
                  value={formData.shortcuts?.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortcuts: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g., /greet, /price"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <ButtonUntitled variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </ButtonUntitled>
              <ButtonUntitled onClick={handleSubmit}>
                {editingResponse ? 'Update' : 'Create'}
              </ButtonUntitled>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <InputUntitled
            placeholder="Search responses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category || ''}>
              {category || 'Uncategorized'}
            </option>
          ))}
        </select>
      </div>

      {/* Responses List */}
      <div className="space-y-3">
        {filteredResponses.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="mb-2 font-medium">No canned responses yet</p>
            <p className="text-sm">
              Create your first response to quickly reply to common questions
            </p>
          </div>
        ) : (
          filteredResponses.map((response) => (
            <div
              key={response.id}
              className="flex items-start justify-between rounded-md border p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{response.name}</h3>
                  {response.category && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                      {response.category}
                    </span>
                  )}
                  {response.usage_count > 0 && (
                    <span className="text-xs text-gray-500">
                      Used {response.usage_count} times
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {response.content}
                </p>
                {response.tags && response.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {response.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="ml-4 flex items-center gap-2">
                <ButtonUntitled
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUseResponse(response.id)}
                >
                  Use
                </ButtonUntitled>
                <ButtonUntitled
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(response)}
                >
                  <Edit className="h-4 w-4" />
                </ButtonUntitled>
                <ButtonUntitled
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(response.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </ButtonUntitled>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
