/**
 * Phone Dialer Component
 * Modern dialpad for making calls
 */

import { useState } from 'react';
import { Phone, PhoneOff, Delete } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { formatPhoneNumber } from '../lib/twilio';
import { useCallHandler, formatCallDuration, getCallStatusColor } from '../lib/callHandler';
import { useActivePhoneNumbers } from '../hooks';

export function Dialer() {
  const [number, setNumber] = useState('');
  const [selectedFromNumber, setSelectedFromNumber] = useState('');

  const { data: phoneNumbers } = useActivePhoneNumbers();
  const { activeCall, startCall, endCall, toggleMute, toggleHold, toggleRecording, isCallActive } = useCallHandler();

  // Set default phone number
  if (phoneNumbers && phoneNumbers.length > 0 && !selectedFromNumber) {
    setSelectedFromNumber(phoneNumbers[0].phone_number);
  }

  const handleDigit = (digit: string) => {
    if (number.length < 15) {
      setNumber((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    setNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (!number.trim() || !selectedFromNumber) return;

    if (isCallActive) {
      await endCall();
    } else {
      await startCall(number, selectedFromNumber);
    }
  };

  const getCallStatusText = () => {
    if (!activeCall) return '';
    switch (activeCall.status) {
      case 'dialing':
        return 'Dialing...';
      case 'ringing':
        return 'Ringing...';
      case 'in_progress':
        return 'Connected';
      case 'ended':
        return 'Call Ended';
      case 'failed':
        return 'Call Failed';
      default:
        return '';
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Call Status Display */}
        <div className="mb-8 text-center">
          {activeCall ? (
            <>
              <div className="mb-2 text-2xl font-semibold">
                {formatPhoneNumber(activeCall.phoneNumber)}
              </div>
              <div
                className={`mb-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium`}
                style={{ backgroundColor: `var(--color-${getCallStatusColor(activeCall.status)}-100)` }}
              >
                {getCallStatusText()}
              </div>
              {activeCall.duration !== undefined && (
                <div className="mt-2 text-2xl font-mono">
                  {formatCallDuration(activeCall.duration)}
                </div>
              )}
            </>
          ) : (
            <input
              type="text"
              value={formatPhoneNumber(number)}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-transparent text-center text-3xl font-light outline-none"
              placeholder="Enter number"
            />
          )}
        </div>

        {/* Number Selector */}
        {phoneNumbers && phoneNumbers.length > 1 && (
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Call from:
            </label>
            <select
              value={selectedFromNumber}
              onChange={(e) => setSelectedFromNumber(e.target.value)}
              disabled={isCallActive}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 disabled:opacity-50"
            >
              {phoneNumbers.map((num) => (
                <option key={num.id} value={num.phone_number}>
                  {formatPhoneNumber(num.phone_number)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dialpad */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            ['1', ''],
            ['2', 'ABC'],
            ['3', 'DEF'],
            ['4', 'GHI'],
            ['5', 'JKL'],
            ['6', 'MNO'],
            ['7', 'PQRS'],
            ['8', 'TUV'],
            ['9', 'WXYZ'],
            ['*', ''],
            ['0', '+'],
            ['#', ''],
          ].map(([digit, letters]) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              disabled={isCallActive}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-gray-100 text-2xl font-medium transition-all hover:bg-gray-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-100"
            >
              <span>{digit}</span>
              {letters && (
                <span className="text-xs font-normal text-gray-500">
                  {letters}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-4">
          {isCallActive ? (
            <>
              {/* Hold */}
              <ButtonUntitled
                onClick={toggleHold}
                variant="outline"
                size="lg"
                className="rounded-full"
              >
                {activeCall?.onHold ? 'Unhold' : 'Hold'}
              </ButtonUntitled>

              {/* Mute */}
              <ButtonUntitled
                onClick={toggleMute}
                variant="outline"
                size="lg"
                className="rounded-full"
              >
                {activeCall?.muted ? 'Unmute' : 'Mute'}
              </ButtonUntitled>

              {/* End Call */}
              <ButtonUntitled
                onClick={handleCall}
                size="lg"
                variant="error"
                className="h-16 w-16 rounded-full p-0"
              >
                <PhoneOff className="h-6 w-6" />
              </ButtonUntitled>

              {/* Recording */}
              <ButtonUntitled
                onClick={toggleRecording}
                variant={activeCall?.recording ? 'primary' : 'outline'}
                size="lg"
                className="rounded-full"
              >
                {activeCall?.recording ? 'Recording' : 'Record'}
              </ButtonUntitled>
            </>
          ) : (
            <>
              {/* Delete */}
              <ButtonUntitled
                onClick={handleDelete}
                variant="outline"
                size="lg"
                className="rounded-full"
                disabled={!number}
              >
                <Delete className="h-5 w-5" />
              </ButtonUntitled>

              {/* Call Button */}
              <ButtonUntitled
                onClick={handleCall}
                size="lg"
                className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-0"
                disabled={!number || !selectedFromNumber}
              >
                <Phone className="h-6 w-6" />
              </ButtonUntitled>

              {/* Add Contact */}
              <ButtonUntitled
                variant="outline"
                size="lg"
                className="rounded-full"
                disabled={!number}
              >
                Add
              </ButtonUntitled>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
