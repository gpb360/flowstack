/**
 * Call Details Component
 * Shows detailed information about a specific call
 */

import { useState, useRef, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, Calendar, User, Play, Pause, Download, FileText } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { useCall, useAddCallNote, useAddCallTags } from '../hooks';
import { formatPhoneNumber, getRecording } from '../lib/twilio';
import { formatCallDuration } from '../lib/callHandler';

interface CallDetailsProps {
  callId: string;
}

export function CallDetails({ callId }: CallDetailsProps) {
  const { data: call, isLoading } = useCall(callId);
  const addNote = useAddCallNote();
  const addTags = useAddCallTags();

  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (call?.notes) {
      setNotes(call.notes);
    }
    if (call?.tags) {
      setTags(call.tags);
    }
  }, [call]);

  const handleSaveNotes = async () => {
    await addNote.mutateAsync({ callId, notes });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput('');
      addTags.mutateAsync({ callId, tags: newTags });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    addTags.mutateAsync({ callId, tags: newTags });
  };

  const handleLoadRecording = async () => {
    if (call?.recording?.storage_path) {
      const result = await getRecording(call.recording.storage_path);
      if (result.success && result.url) {
        setRecordingUrl(result.url);
      }
    }
  };

  const handleTogglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading call details...</div>;
  }

  if (!call) {
    return <div className="p-6">Call not found</div>;
  }

  const getStatusVariant = (status: string): 'success' | 'error' | 'warning' | 'neutral' | 'info' => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'in_progress':
      case 'ringing': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {call.direction === 'inbound' ? (
              <PhoneIncoming className="h-5 w-5 text-green-600" />
            ) : (
              <PhoneOutgoing className="h-5 w-5 text-blue-600" />
            )}
            <h1 className="text-2xl font-bold">Call Details</h1>
          </div>
          <p className="text-gray-600">
            {new Date(call.started_at).toLocaleString()}
          </p>
        </div>
        <BadgeUntitled variant={getStatusVariant(call.status)}>
          {call.status}
        </BadgeUntitled>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Call Information */}
          <CardUntitled title="Call Information">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">From</div>
                  <div className="font-medium">{formatPhoneNumber(call.from_number)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">To</div>
                  <div className="font-medium">{formatPhoneNumber(call.to_number)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Direction</div>
                  <div className="font-medium capitalize">{call.direction}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-medium">
                    {call.duration_seconds ? formatCallDuration(call.duration_seconds) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-medium capitalize">{call.status}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Provider</div>
                  <div className="font-medium capitalize">{call.provider}</div>
                </div>
              </div>

              {/* Contact Info */}
              {call.contact && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <User className="h-4 w-4" />
                    Contact Information
                  </div>
                  <div className="mt-2">
                    <div className="font-medium">
                      {call.contact.first_name} {call.contact.last_name}
                    </div>
                    <div className="text-sm text-gray-600">{call.contact.email}</div>
                  </div>
                </div>
              )}
            </div>
          </CardUntitled>

          {/* Recording */}
          {call.recording && (
            <CardUntitled title="Call Recording">
              {!recordingUrl ? (
                <ButtonUntitled onClick={handleLoadRecording}>
                  <Download className="mr-2 h-4 w-4" />
                  Load Recording
                </ButtonUntitled>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <ButtonUntitled onClick={handleTogglePlay} variant="outline" isIconOnly>
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </ButtonUntitled>
                    <div className="flex-1 text-sm text-gray-600">
                      {call.recording.duration_seconds
                        ? formatCallDuration(call.recording.duration_seconds)
                        : 'Recording'}
                    </div>
                  </div>
                  <audio
                    ref={audioRef}
                    src={recordingUrl}
                    onEnded={() => setIsPlaying(false)}
                    controls
                    className="w-full"
                  />
                </div>
              )}

              {/* Transcription */}
              {call.recording.transcript && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Transcription
                  </div>
                  <p className="text-sm text-gray-700">{call.recording.transcript}</p>
                </div>
              )}
            </CardUntitled>
          )}

          {/* Notes */}
          <CardUntitled title="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this call..."
              rows={4}
              className="w-full mb-2 rounded border border-gray-300 p-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
            />
            <ButtonUntitled onClick={handleSaveNotes} disabled={addNote.isPending}>
              {addNote.isPending ? 'Saving...' : 'Save Notes'}
            </ButtonUntitled>
          </CardUntitled>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <CardUntitled title="Tags">
            <div className="mb-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <BadgeUntitled key={tag} variant="neutral" size="sm" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                  {tag} ×
                </BadgeUntitled>
              ))}
            </div>
            <div className="flex gap-2">
              <InputUntitled
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
              />
              <ButtonUntitled onClick={handleAddTag} size="sm">
                Add
              </ButtonUntitled>
            </div>
          </CardUntitled>

          {/* Call Flow */}
          {call.call_flow && (
            <CardUntitled title="Call Flow">
              <pre className="overflow-auto text-xs text-gray-700">
                {JSON.stringify(call.call_flow, null, 2)}
              </pre>
            </CardUntitled>
          )}

          {/* Quality Metrics */}
          {call.quality_score && (
            <CardUntitled title="Quality Score">
              <div className="text-3xl font-bold">
                {call.quality_score.toFixed(1)}
                <span className="text-lg text-gray-600">/5.0</span>
              </div>
            </CardUntitled>
          )}
        </div>
      </div>
    </div>
  );
}
