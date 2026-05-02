# Phone System Module

## Overview

The Phone System module provides Twilio-powered calling, SMS messaging, and voicemail capabilities for FlowStack. It includes a full-featured dialer, call recording, voicemail management, and two-way SMS conversations.

## Features

### 1. Phone Dialer
- Modern touch-tone dialpad
- Make outbound calls from any purchased number
- Real-time call status updates
- In-call controls (mute, hold, recording, transfer)
- Call duration timer
- Contact integration

### 2. Call Management
- Complete call history and logs
- Call recording playback
- Call transcription (AI-powered)
- Call notes and tags
- Contact association
- Call statistics and analytics
- Search and filter calls

### 3. Voicemail System
- Voicemail inbox with new/listened/archived states
- Audio player for voicemail messages
- Voicemail transcription
- Call-back functionality
- Bulk actions (archive, delete)
- Unread count badge

### 4. SMS Messaging
- Two-way SMS conversations
- Thread-based messaging interface
- Real-time message delivery status
- MMS support (images/media)
- Message search and filtering
- Unread message indicators
- Contact integration

### 5. Phone Number Management
- Purchase new phone numbers
- Number search by area code
- Configure number settings (forwarding, recording, voicemail)
- Track call attribution by number
- View number capabilities (voice, SMS, MMS)
- Release numbers

## Database Schema

The phone system uses 6 tables:

1. **phone_numbers** - Purchased/tracked phone numbers
2. **phone_calls** - Call logs and metadata
3. **phone_recordings** - Call recordings storage
4. **voicemails** - Voicemail messages
5. **sms_threads** - SMS conversation threads
6. **sms_messages** - Individual SMS messages

See `db/phone_schema.sql` for complete schema definition.

## API Integration

### Twilio Edge Functions

The module requires these Supabase Edge Functions:

1. **twilio-get-config** - Retrieve Twilio credentials
2. **twilio-make-call** - Initiate outbound call
3. **twilio-end-call** - End active call
4. **twilio-send-sms** - Send SMS message
5. **twilio-purchase-number** - Purchase phone number
6. **twilio-search-numbers** - Search available numbers
7. **twilio-release-number** - Release phone number
8. **twilio-get-recording** - Get call recording URL
9. **twilio-get-transcription** - Get call transcription
10. **twilio-validate-number** - Validate phone number

### Environment Variables

Required environment variables (set in Supabase):

```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

## Directory Structure

```
src/features/phone/
├── lib/
│   ├── twilio.ts          # Twilio API client
│   └── callHandler.ts     # Call state management
├── hooks/
│   ├── useCalls.ts        # Call data hooks
│   ├── usePhoneNumbers.ts # Phone number hooks
│   ├── useVoicemails.ts   # Voicemail hooks
│   ├── useSMS.ts          # SMS hooks
│   └── index.ts
├── dialer/
│   ├── Dialer.tsx         # Phone dialpad UI
│   └── ActiveCall.tsx     # In-call UI
├── calls/
│   ├── CallsList.tsx      # Call history
│   └── CallDetails.tsx    # Call detail view
├── voicemail/
│   └── VoicemailList.tsx  # Voicemail inbox
├── sms/
│   ├── SMSList.tsx        # SMS conversations
│   └── SMSConversation.tsx # Thread view
├── numbers/
│   └── NumbersList.tsx    # Phone number management
├── PhoneLayout.tsx        # Main layout
└── index.ts
```

## Usage

### Making a Call

```tsx
import { useCallHandler } from '@/features/phone';

function MyComponent() {
  const { startCall } = useCallHandler();

  const handleCall = async () => {
    await startCall('+1234567890', '+1987654321');
  };

  return <button onClick={handleCall}>Call Now</button>;
}
```

### Sending an SMS

```tsx
import { useSendSMS } from '@/features/phone';

function MyComponent() {
  const sendSMS = useSendSMS();

  const handleSend = async () => {
    await sendSMS.mutateAsync({
      to: '+1234567890',
      from: '+1987654321',
      body: 'Hello from FlowStack!',
    });
  };

  return <button onClick={handleSend}>Send SMS</button>;
}
```

### Fetching Call History

```tsx
import { useCalls } from '@/features/phone';

function CallHistory() {
  const { data: calls, isLoading } = useCalls();

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {calls?.map(call => (
        <li key={call.id}>
          {call.from_number} → {call.to_number}
        </li>
      ))}
    </ul>
  );
}
```

## Routes

- `/phone` - Dialer (default)
- `/phone/calls` - Call history
- `/phone/calls/:callId` - Call details
- `/phone/voicemail` - Voicemail inbox
- `/phone/sms` - SMS conversations
- `/phone/sms/:threadId` - SMS thread
- `/phone/numbers` - Phone numbers management

## Components

### Dialer
Main phone dialpad with:
- Number display
- Dialpad (0-9, *, #)
- Call/end buttons
- In-call controls
- Number selection

### ActiveCall
In-call UI with:
- Caller info
- Duration timer
- Mute/unmute
- Hold/unhold
- Recording toggle
- Speaker toggle
- Transfer option

### CallsList
Call history table with:
- Direction indicator (inbound/outbound)
- From/to numbers
- Contact association
- Duration
- Status badges
- Recording access
- Search and filter

### VoicemailList
Voicemail inbox with:
- New/listened/archived states
- Audio player
- Transcription display
- Call-back button
- Bulk actions
- Unread count

### SMSList & SMSConversation
SMS messaging with:
- Conversation list
- Real-time updates
- Message bubbles
- Delivery status
- MMS support
- Typing indicators

### NumbersList
Phone number management:
- Number inventory
- Capabilities display
- Status tracking
- Purchase flow
- Settings access

## Permissions

The phone system respects FlowStack's role-based access control:

- **Owner** - Full access to all features
- **Admin** - Can manage numbers, view all calls, send messages
- **Member** - Can view assigned calls, send messages

## Webhooks

Configure these Twilio webhooks for real-time updates:

1. **Voice Webhook** - Call status updates
2. **SMS Webhook** - Incoming messages
4. **Recording Webhook** - Recording availability
5. **Transcription Webhook** - Transcription completion

Webhook URLs should point to your Supabase Edge Functions.

## Best Practices

1. **Number Organization** - Use tracking sources to attribute calls to campaigns
2. **Recording Compliance** - Always obtain consent before recording
3. **Response Times** - Monitor voicemail response times
4. **Message Templates** - Create reusable SMS templates
5. **Number Rotation** - Use multiple numbers for different campaigns

## Troubleshooting

### Calls not connecting
- Verify Twilio credentials
- Check phone number status (must be 'active')
- Ensure sufficient Twilio balance
- Check webhook URLs are accessible

### SMS not delivering
- Verify SMS is enabled on the number
- Check recipient number format (E.164)
- Review message content (no spam keywords)
- Check Twilio SMS quotas

### Voicemail not appearing
- Verify voicemail is enabled
- Check webhook configuration
- Review Twilio logs for errors

## Future Enhancements

Planned features:
- [ ] Call scripting and prompts
- [ ] Call queuing and IVR
- [ ] SMS campaigns and automation
- [ ] Call analytics dashboard
- [ ] Integrations with CRM workflows
- [ ] Call recording AI analysis
- [ ] SMS templates and variables
- [ ] Multi-line support
- [ ] Conference calling

## Support

For issues or questions:
1. Check Twilio dashboard for errors
2. Review Edge Function logs
3. Verify database RLS policies
4. Check webhook delivery status
5. Review browser console for errors
