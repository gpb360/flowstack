// @ts-nocheck
/**
 * Call Handler - Manages active calls and call state
 */

import { useState, useCallback, useRef } from 'react';

export type CallStatus = 'idle' | 'dialing' | 'ringing' | 'in_progress' | 'ended' | 'failed';

export interface ActiveCall {
  callId: string;
  phoneNumber: string;
  status: CallStatus;
  direction: 'inbound' | 'outbound';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  muted?: boolean;
  onHold?: boolean;
  recording?: boolean;
}

export interface CallEvent {
  type: 'status' | 'error' | 'recording' | 'dtmf' | 'hangup';
  data: any;
  timestamp: Date;
}

export function useCallHandler() {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callEvents, setCallEvents] = useState<CallEvent[]>([]);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start a new call
  const startCall = useCallback(async (phoneNumber: string, fromNumber: string) => {
    try {
      // Import here to avoid circular dependency
      const { makeCall } = await import('./twilio');

      setActiveCall({
        callId: `temp-${Date.now()}`,
        phoneNumber,
        status: 'dialing',
        direction: 'outbound',
        startTime: new Date(),
      });

      const result = await makeCall({
        to: phoneNumber,
        from: fromNumber,
        record: true,
      });

      if (!result.success) {
        addCallEvent('error', { message: result.error });
        setActiveCall((prev) => prev ? { ...prev, status: 'failed' } : null);
        return false;
      }

      // Update with actual call SID
      setActiveCall((prev) => prev ? {
        ...prev,
        callId: result.callSid!,
        status: 'ringing',
      } : null);

      return true;
    } catch (error: any) {
      addCallEvent('error', { message: error.message });
      setActiveCall(null);
      return false;
    }
  }, []);

  // End active call
  const endCall = useCallback(async () => {
    if (!activeCall) return;

    try {
      const { endCall: twilioEndCall } = await import('./twilio');
      await twilioEndCall(activeCall.callId);

      setActiveCall((prev) => prev ? {
        ...prev,
        status: 'ended',
        endTime: new Date(),
        duration: prev.startTime ? Math.floor((Date.now() - prev.startTime.getTime()) / 1000) : 0,
      } : null);

      // Clear active call after a delay
      setTimeout(() => {
        setActiveCall(null);
        setCallEvents([]);
      }, 3000);
    } catch (error: any) {
      addCallEvent('error', { message: error.message });
    }
  }, [activeCall]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setActiveCall((prev) => prev ? { ...prev, muted: !prev.muted } : null);
    addCallEvent('status', { action: 'toggle_mute', muted: !activeCall?.muted });
  }, [activeCall]);

  // Toggle hold
  const toggleHold = useCallback(() => {
    setActiveCall((prev) => prev ? { ...prev, onHold: !prev.onHold } : null);
    addCallEvent('status', { action: 'toggle_hold', onHold: !activeCall?.onHold });
  }, [activeCall]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    setActiveCall((prev) => prev ? { ...prev, recording: !prev.recording } : null);
    addCallEvent('recording', { action: 'toggle_recording', recording: !activeCall?.recording });
  }, [activeCall]);

  // Send DTMF tone
  const sendDTMF = useCallback(async (digit: string) => {
    if (!activeCall) return;

    try {
      // This would call Twilio API to send DTMF
      addCallEvent('dtmf', { digit });
    } catch (error: any) {
      addCallEvent('error', { message: error.message });
    }
  }, [activeCall]);

  // Transfer call
  const transferCall = useCallback(async (targetNumber: string) => {
    if (!activeCall) return false;

    try {
      // This would call Twilio API to transfer call
      addCallEvent('status', { action: 'transfer', target: targetNumber });
      return true;
    } catch (error: any) {
      addCallEvent('error', { message: error.message });
      return false;
    }
  }, [activeCall]);

  // Add call event
  const addCallEvent = useCallback((type: CallEvent['type'], data: any) => {
    setCallEvents((prev) => [
      ...prev,
      {
        type,
        data,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Update call status (called from webhooks)
  const updateCallStatus = useCallback((status: CallStatus, metadata?: any) => {
    setActiveCall((prev) => {
      if (!prev) return null;

      const updated = { ...prev, status };

      // If call ended, set end time and duration
      if (status === 'ended' || status === 'failed') {
        updated.endTime = new Date();
        updated.duration = prev.startTime
          ? Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
          : 0;
      }

      return updated;
    });

    if (metadata) {
      addCallEvent('status', { ...metadata, status });
    }
  }, [addCallEvent]);

  // Answer incoming call
  const answerCall = useCallback((callId: string, phoneNumber: string) => {
    setActiveCall({
      callId,
      phoneNumber,
      status: 'in_progress',
      direction: 'inbound',
      startTime: new Date(),
    });

    addCallEvent('status', { action: 'answer', callId });
  }, [addCallEvent]);

  // Reject incoming call
  const rejectCall = useCallback((callId: string) => {
    addCallEvent('status', { action: 'reject', callId });
  }, [addCallEvent]);

  return {
    activeCall,
    callEvents,
    startCall,
    endCall,
    toggleMute,
    toggleHold,
    toggleRecording,
    sendDTMF,
    transferCall,
    updateCallStatus,
    answerCall,
    rejectCall,
    isCallActive: activeCall?.status === 'in_progress' || activeCall?.status === 'ringing',
  };
}

// Format duration as MM:SS
export function formatCallDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Get status badge color
export function getCallStatusColor(status: CallStatus): string {
  switch (status) {
    case 'idle':
      return 'gray';
    case 'dialing':
    case 'ringing':
      return 'blue';
    case 'in_progress':
      return 'green';
    case 'ended':
      return 'gray';
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
}
