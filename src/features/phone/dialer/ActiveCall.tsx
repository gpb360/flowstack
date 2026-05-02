/**
 * Active Call UI Component
 * Displays when a call is in progress
 */

import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Pause, Play, MoreVertical } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { ActiveCall as ActiveCallType, formatCallDuration } from '../lib/callHandler';
import { formatPhoneNumber } from '../lib/twilio';

interface ActiveCallProps {
  call: ActiveCallType;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onToggleRecording: () => void;
  onTransfer?: (number: string) => void;
}

export function ActiveCall({
  call,
  onEndCall,
  onToggleMute,
  onToggleHold,
  onToggleRecording,
  onTransfer,
}: ActiveCallProps) {
  const [duration, setDuration] = useState(call.duration || 0);

  // Update duration every second
  useEffect(() => {
    if (call.status !== 'in_progress') return;

    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [call.status]);

  return (
    <div className="flex h-full flex-col items-center justify-between bg-gradient-to-b from-gray-50 to-white p-8">
      {/* Top Section */}
      <div className="flex w-full items-center justify-between">
        <BadgeUntitled variant={call.direction === 'inbound' ? 'primary' : 'neutral'}>
          {call.direction === 'inbound' ? 'Inbound' : 'Outbound'}
        </BadgeUntitled>

        {call.recording && (
          <BadgeUntitled variant="error" className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
            Recording
          </BadgeUntitled>
        )}

        <ButtonUntitled variant="ghost" size="sm" isIconOnly>
          <MoreVertical className="h-4 w-4" />
        </ButtonUntitled>
      </div>

      {/* Middle Section - Caller Info */}
      <div className="flex-1 flex-col items-center justify-center">
        <div className="mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-semibold shadow-lg">
          {call.phoneNumber.charAt(0)}
        </div>

        <h2 className="mb-2 text-3xl font-semibold">
          {formatPhoneNumber(call.phoneNumber)}
        </h2>

        <div className="text-lg text-gray-600">
          {call.status === 'ringing' && 'Ringing...'}
          {call.status === 'in_progress' && formatCallDuration(duration)}
          {call.status === 'ended' && 'Call Ended'}
          {call.status === 'failed' && 'Call Failed'}
        </div>

        {call.onHold && (
          <BadgeUntitled variant="neutral" className="mt-4">
            On Hold
          </BadgeUntitled>
        )}
      </div>

      {/* Bottom Section - Controls */}
      <div className="w-full max-w-md">
        <div className="grid grid-cols-3 gap-4">
          {/* Mute */}
          <ButtonUntitled
            onClick={onToggleMute}
            variant={call.muted ? 'error' : 'outline'}
            size="lg"
            className="flex flex-col gap-1 rounded-2xl py-6"
          >
            {call.muted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
            <span className="text-xs">{call.muted ? 'Unmute' : 'Mute'}</span>
          </ButtonUntitled>

          {/* Keypad */}
          <ButtonUntitled
            variant="outline"
            size="lg"
            className="flex flex-col gap-1 rounded-2xl py-6"
          >
            <span className="text-2xl font-semibold">#</span>
            <span className="text-xs">Keypad</span>
          </ButtonUntitled>

          {/* Speaker */}
          <ButtonUntitled
            variant="outline"
            size="lg"
            className="flex flex-col gap-1 rounded-2xl py-6"
          >
            <Volume2 className="h-6 w-6" />
            <span className="text-xs">Speaker</span>
          </ButtonUntitled>

          {/* Hold */}
          <ButtonUntitled
            onClick={onToggleHold}
            variant={call.onHold ? 'primary' : 'outline'}
            size="lg"
            className="flex flex-col gap-1 rounded-2xl py-6"
          >
            <Pause className="h-6 w-6" />
            <span className="text-xs">{call.onHold ? 'Unhold' : 'Hold'}</span>
          </ButtonUntitled>

          {/* Recording */}
          <ButtonUntitled
            onClick={onToggleRecording}
            variant={call.recording ? 'error' : 'outline'}
            size="lg"
            className="flex flex-col gap-1 rounded-2xl py-6"
          >
            <div className={`h-6 w-6 rounded-full ${call.recording ? 'bg-red-600' : 'bg-gray-400'}`} />
            <span className="text-xs">{call.recording ? 'Stop' : 'Record'}</span>
          </ButtonUntitled>

          {/* Transfer */}
          <ButtonUntitled
            variant="outline"
            size="lg"
            className="flex flex-col gap-1 rounded-2xl py-6"
            disabled
          >
            <Phone className="h-6 w-6" />
            <span className="text-xs">Transfer</span>
          </ButtonUntitled>
        </div>

        {/* End Call */}
        <div className="mt-6 flex justify-center">
          <ButtonUntitled
            onClick={onEndCall}
            size="lg"
            variant="error"
            className="h-16 w-16 rounded-full p-0 shadow-lg"
          >
            <PhoneOff className="h-6 w-6" />
          </ButtonUntitled>
        </div>
      </div>
    </div>
  );
}
