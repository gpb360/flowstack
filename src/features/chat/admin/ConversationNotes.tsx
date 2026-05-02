/**
 * Conversation Notes Component
 * Internal agent notes for a conversation
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { AvatarUntitled } from '@/components/ui/avatar-untitled';
import { Pin as PushPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatNote } from '../types';

interface ConversationNotesProps {
  conversationId: string;
  notes: ChatNote[];
  onCreateNote: (note: Partial<ChatNote>) => void;
}

export function ConversationNotes({
  conversationId,
  notes,
  onCreateNote,
}: ConversationNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateNote({
        conversation_id: conversationId,
        note: newNote.trim(),
        agent_id: '', // Will be filled in by mutation
      });
      setNewNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Internal Notes</h2>

        {notes.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="mb-2">No notes yet</p>
            <p className="text-sm">Add internal notes visible only to agents</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  'rounded-md border p-4',
                  note.is_pinned && 'border-yellow-400 bg-yellow-50'
                )}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AvatarUntitled className="h-6 w-6">
                      <AvatarUntitled.Image src={note.agent?.avatar_url} />
                      <AvatarUntitled.Fallback>
                        {note.agent?.full_name?.[0] || 'A'}
                      </AvatarUntitled.Fallback>
                    </AvatarUntitled>
                    <span className="text-sm font-medium text-gray-900">
                      {note.agent?.full_name || 'Agent'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {note.is_pinned && (
                      <PushPin className="h-3 w-3 text-yellow-600" />
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(note.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {note.note}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Note Form */}
      <div className="border-t bg-gray-50 p-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add an internal note..."
          rows={3}
          className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex justify-end">
          <ButtonUntitled
            onClick={handleSubmit}
            disabled={!newNote.trim() || isSubmitting}
            size="sm"
          >
            {isSubmitting ? 'Adding...' : 'Add Note'}
          </ButtonUntitled>
        </div>
      </div>
    </div>
  );
}
