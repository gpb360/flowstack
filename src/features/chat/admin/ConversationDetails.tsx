/**
 * Conversation Details Component
 * Displays detailed information about a conversation
 */

import { fetchConversation } from '../lib/supabase';

interface ConversationDetailsProps {
  conversationId: string;
}

export async function ConversationDetails({ conversationId }: ConversationDetailsProps) {
  const { data: conversation } = await fetchConversation(conversationId);

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Conversation Details</h2>

      <div className="space-y-6">
        {/* Visitor Information */}
        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Visitor Information</h3>
          <div className="rounded-md border bg-gray-50 p-4">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600">Name</dt>
                <dd className="font-medium text-gray-900">
                  {conversation.visitor_name || 'Not provided'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Email</dt>
                <dd className="font-medium text-gray-900">
                  {conversation.visitor_email || 'Not provided'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Phone</dt>
                <dd className="font-medium text-gray-900">
                  {conversation.visitor_phone || 'Not provided'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Status</dt>
                <dd className="font-medium text-gray-900 capitalize">
                  {conversation.status}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Source Information */}
        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Source Information</h3>
          <div className="rounded-md border bg-gray-50 p-4">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600">Source URL</dt>
                <dd className="font-medium text-gray-900 break-all">
                  {conversation.source_url || 'Direct'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Referrer</dt>
                <dd className="font-medium text-gray-900 break-all">
                  {conversation.referrer_url || 'Direct'}
                </dd>
              </div>
              {conversation.utm_source && (
                <>
                  <div>
                    <dt className="text-gray-600">UTM Source</dt>
                    <dd className="font-medium text-gray-900">{conversation.utm_source}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">UTM Medium</dt>
                    <dd className="font-medium text-gray-900">{conversation.utm_medium}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </section>

        {/* Technical Information */}
        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Technical Information</h3>
          <div className="rounded-md border bg-gray-50 p-4">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600">Browser</dt>
                <dd className="font-medium text-gray-900">
                  {conversation.browser || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">OS</dt>
                <dd className="font-medium text-gray-900">
                  {conversation.os || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Device</dt>
                <dd className="font-medium text-gray-900">
                  {conversation.device_type || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Language</dt>
                <dd className="font-medium text-gray-900">
                  {conversation.language || 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Location Information */}
        {(conversation.location_city || conversation.location_country) && (
          <section>
            <h3 className="mb-3 text-sm font-medium text-gray-700">Location</h3>
            <div className="rounded-md border bg-gray-50 p-4">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {conversation.location_city && (
                  <div>
                    <dt className="text-gray-600">City</dt>
                    <dd className="font-medium text-gray-900">{conversation.location_city}</dd>
                  </div>
                )}
                {conversation.location_country && (
                  <div>
                    <dt className="text-gray-600">Country</dt>
                    <dd className="font-medium text-gray-900">{conversation.location_country}</dd>
                  </div>
                )}
              </dl>
            </div>
          </section>
        )}

        {/* Timestamps */}
        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Timestamps</h3>
          <div className="rounded-md border bg-gray-50 p-4">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600">Started</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(conversation.started_at).toLocaleString()}
                </dd>
              </div>
              {conversation.ended_at && (
                <div>
                  <dt className="text-gray-600">Ended</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(conversation.ended_at).toLocaleString()}
                  </dd>
                </div>
              )}
              {conversation.last_message_at && (
                <div>
                  <dt className="text-gray-600">Last Message</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(conversation.last_message_at).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
