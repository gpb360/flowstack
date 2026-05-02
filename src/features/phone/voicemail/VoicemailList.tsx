/**
 * Voicemail List Component
 * Displays all voicemail messages
 */

import { useState, useRef, useEffect } from 'react';
import { Phone, Play, Pause, Trash2, Archive, CheckCircle, Clock } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { useVoicemails, useMarkVoicemailListened, useDeleteVoicemail, useArchiveVoicemail } from '../hooks';
import { formatPhoneNumber } from '../lib/twilio';
import { formatDistanceToNow } from 'date-fns';

export function VoicemailList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const { data: voicemails, isLoading, refetch } = useVoicemails(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );

  const markListened = useMarkVoicemailListened();
  const deleteVoicemail = useDeleteVoicemail();
  const archiveVoicemail = useArchiveVoicemail();

  const filteredVoicemails = voicemails?.filter((vm) =>
    vm.from_number.includes(searchQuery) ||
    vm.caller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vm.transcription?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handlePlay = (voicemail: any) => {
    const audio = audioRefs.current.get(voicemail.id);
    if (audio) {
      if (playingId === voicemail.id) {
        audio.pause();
        setPlayingId(null);
      } else {
        // Stop any currently playing audio
        audioRefs.current.forEach((a) => a.pause());
        audio.play();
        setPlayingId(voicemail.id);

        // Mark as listened
        if (voicemail.status === 'new') {
          markListened.mutate(voicemail.id);
        }
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this voicemail?')) {
      await deleteVoicemail.mutateAsync(id);
    }
  };

  const handleArchive = async (id: string) => {
    await archiveVoicemail.mutateAsync(id);
  };

  const handleCallBack = (phoneNumber: string) => {
    // This would open the dialer with the number pre-filled
    window.location.href = `/phone?call=${phoneNumber}`;
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeaderUntitled
        title="Voicemails"
        description="Listen to and manage your voicemail messages"
        actions={
          <ButtonUntitled onClick={() => refetch()}>
            Refresh
          </ButtonUntitled>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <InputUntitled
            placeholder="Search voicemails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
        >
          <option value="all">All Voicemails</option>
          <option value="new">New</option>
          <option value="listened">Listened</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Voicemail List */}
      {isLoading ? (
        <div className="text-center py-12">Loading voicemails...</div>
      ) : filteredVoicemails.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No voicemails found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVoicemails.map((voicemail) => (
            <CardUntitled
              key={voicemail.id}
              className={`transition-shadow hover:shadow-md ${
                voicemail.status === 'new' ? 'border-l-4 border-l-[#D4AF37]' : ''
              }`}
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between pb-3 border-b">
                <div>
                  <div className="text-lg font-semibold">
                    {voicemail.caller_name || formatPhoneNumber(voicemail.from_number)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(voicemail.received_at), { addSuffix: true })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {voicemail.status === 'new' && (
                    <BadgeUntitled variant="info" size="sm">New</BadgeUntitled>
                  )}
                  {voicemail.status === 'listened' && (
                    <BadgeUntitled variant="success" size="sm">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Listened
                    </BadgeUntitled>
                  )}
                  {voicemail.duration_seconds && (
                    <BadgeUntitled variant="neutral" size="sm">
                      {Math.floor(voicemail.duration_seconds / 60)}:
                      {(voicemail.duration_seconds % 60).toString().padStart(2, '0')}
                    </BadgeUntitled>
                  )}
                </div>
              </div>

              {/* Audio Player */}
              {voicemail.url && (
                <div className="mb-4">
                  <audio
                    ref={(el) => {
                      if (el) audioRefs.current.set(voicemail.id, el);
                    }}
                    src={voicemail.url}
                    onEnded={() => setPlayingId(null)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <ButtonUntitled
                      onClick={() => handlePlay(voicemail)}
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      isIconOnly
                    >
                      {playingId === voicemail.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </ButtonUntitled>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D4AF37] transition-all"
                        style={{
                          width:
                            playingId === voicemail.id
                              ? '100%'
                              : '0%',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Transcription */}
              {voicemail.transcription && (
                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {voicemail.transcription}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <ButtonUntitled
                    onClick={() => handleCallBack(voicemail.from_number)}
                    size="sm"
                    variant="outline"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Back
                  </ButtonUntitled>
                  <ButtonUntitled
                    onClick={() => handleArchive(voicemail.id)}
                    size="sm"
                    variant="ghost"
                    isIconOnly
                    disabled={archiveVoicemail.isPending}
                  >
                    <Archive className="h-4 w-4" />
                  </ButtonUntitled>
                  <ButtonUntitled
                    onClick={() => handleDelete(voicemail.id)}
                    size="sm"
                    variant="ghost"
                    isIconOnly
                    disabled={deleteVoicemail.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </ButtonUntitled>
                </div>
                {voicemail.phone_number && (
                  <div className="text-sm text-gray-600">
                    To: {formatPhoneNumber(voicemail.phone_number.phone_number)}
                  </div>
                )}
              </div>
            </CardUntitled>
          ))}
        </div>
      )}
    </div>
  );
}
