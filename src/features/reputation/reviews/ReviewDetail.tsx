// @ts-nocheck
/**
 * Review Detail Component
 * Displays full review information with response management
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Star, MessageSquare, Flag, ExternalLink, Reply } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { useReviewDetail, useUpdateReviewStatus } from '../hooks/useReviews';
import { useReviewResponses, useCreateResponse, usePostResponse, useSuggestedTemplates } from '../hooks/useReputationAlerts';
import { useReviewSources } from '../hooks/useReviewSources';
import { cn } from '@/lib/utils';

export function ReviewDetail() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const [responseText, setResponseText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: review, isLoading } = useReviewDetail(reviewId!);
  const { data: sources } = useReviewSources();
  const { data: responses, refetch: refetchResponses } = useReviewResponses(reviewId!);
  const { data: suggestedTemplates } = useSuggestedTemplates(review?.rating || 0, review?.sentiment);
  const updateStatus = useUpdateReviewStatus();
  const createResponse = useCreateResponse();
  const postResponse = usePostResponse();

  const source = sources?.find((s) => s.id === review?.source_id);

  if (isLoading) {
    return <div>Loading review...</div>;
  }

  if (!review) {
    return <div>Review not found</div>;
  }

  const handleResponseSubmit = async () => {
    if (!responseText.trim()) return;

    try {
      const response = await createResponse.mutateAsync({
        reviewId: review.id,
        content: responseText,
        response_type: 'public',
        status: 'draft',
      });

      setResponseText('');
      setSelectedTemplate(null);
      await refetchResponses();
    } catch (error) {
      console.error('Failed to create response:', error);
    }
  };

  const handlePostResponse = async (responseId: string) => {
    try {
      await postResponse.mutateAsync(responseId);
      await refetchResponses();
    } catch (error) {
      console.error('Failed to post response:', error);
    }
  };

  const applyTemplate = (template: any) => {
    // In a real implementation, you'd replace template variables
    setResponseText(template.content);
    setSelectedTemplate(template.id);
  };

  return (
    <div className="space-y-6">
      <PageHeaderUntitled
        title="Review Details"
        actions={
          <ButtonUntitled variant="secondary" onClick={() => navigate('/reputation/reviews')}>
            Back to Reviews
          </ButtonUntitled>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Review Content */}
          <CardUntitled
            title={review.title || 'Review'}
            description={`${review.reviewer_name || 'Anonymous'} • ${formatDistanceToNow(new Date(review.review_date), { addSuffix: true })}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={review.rating} />
              <span className="text-sm text-muted-foreground">{review.rating} stars</span>
            </div>

            <div className="flex gap-2 mb-4">
              {review.is_verified_purchase && (
                <BadgeUntitled variant="neutral" size="sm">Verified</BadgeUntitled>
              )}
              <BadgeUntitled
                variant={review.sentiment === 'positive' ? 'success' : review.sentiment === 'negative' ? 'error' : 'neutral'}
                size="sm"
              >
                {review.sentiment || 'Unanalyzed'}
              </BadgeUntitled>
            </div>

            <p className="text-lg mb-4">{review.content}</p>

            {review.images && review.images.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 font-medium">Images</h4>
                <div className="flex gap-2">
                  {review.images.map((image: string, index: number) => (
                    <a
                      key={index}
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="h-24 w-24 rounded border object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {review.tags && review.tags.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 font-medium">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {review.tags.map((tag: string) => (
                    <BadgeUntitled key={tag} variant="neutral" size="sm">
                      {tag}
                    </BadgeUntitled>
                  ))}
                </div>
              </div>
            )}

            {review.reviewer_profile_url && (
              <ButtonUntitled variant="outline" size="sm">
                <a href={review.reviewer_profile_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Reviewer Profile
                </a>
              </ButtonUntitled>
            )}
          </CardUntitled>

          {/* Responses */}
          <CardUntitled title="Responses" description={`${responses?.length || 0} response(s)`}>
            <div className="space-y-4">
              {responses && responses.length > 0 ? (
                responses.map((response: any) => (
                  <div key={response.id} className="rounded border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BadgeUntitled variant={response.status === 'posted' ? 'success' : 'neutral'} size="sm">
                          {response.status}
                        </BadgeUntitled>
                        {response.author_name && (
                          <span className="text-sm text-muted-foreground">
                            by {response.author_name}
                          </span>
                        )}
                      </div>
                      {response.posted_at && (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(response.posted_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{response.content}</p>
                    {response.status === 'draft' && (
                      <div className="mt-2 flex gap-2">
                        <ButtonUntitled size="sm" onClick={() => handlePostResponse(response.id)}>
                          Post Response
                        </ButtonUntitled>
                        <ButtonUntitled size="sm" variant="outline">
                          Edit
                        </ButtonUntitled>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No responses yet</p>
              )}
            </div>
          </CardUntitled>
        </div>

        <div className="space-y-6">
          {/* Source Info */}
          <CardUntitled title="Source">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Platform:</span>{' '}
                {source?.platform}
              </div>
              <div>
                <span className="font-medium">Business:</span>{' '}
                {source?.business_name}
              </div>
              {source?.review_page_url && (
                <ButtonUntitled variant="outline" size="sm" className="mt-2">
                  <a href={source.review_page_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Platform
                  </a>
                </ButtonUntitled>
              )}
            </div>
          </CardUntitled>

          {/* Actions */}
          <CardUntitled title="Actions">
            <div className="space-y-2">
              <ButtonUntitled
                variant="outline"
                className="w-full justify-start"
                onClick={() => updateStatus.mutate({ reviewId: review.id, status: 'read' })}
              >
                Mark as Read
              </ButtonUntitled>
              <ButtonUntitled
                variant="outline"
                className="w-full justify-start"
                onClick={() => updateStatus.mutate({ reviewId: review.id, status: 'flagged' })}
              >
                <Flag className="mr-2 h-4 w-4" />
                Flag Review
              </ButtonUntitled>
            </div>
          </CardUntitled>

          {/* Suggested Templates */}
          {suggestedTemplates && suggestedTemplates.length > 0 && (
            <CardUntitled title="Suggested Responses" description="Templates matching this review">
              <div className="space-y-2">
                {suggestedTemplates.map((template: any) => (
                  <ButtonUntitled
                    key={template.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => applyTemplate(template)}
                  >
                    <Reply className="mr-2 h-4 w-4" />
                    {template.name}
                  </ButtonUntitled>
                ))}
              </div>
            </CardUntitled>
          )}
        </div>
      </div>

      {/* Response Editor */}
      <CardUntitled title="Write Response">
        <div className="space-y-4">
          <textarea
            className="w-full rounded border border-gray-300 p-3 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
            rows={5}
            placeholder="Write your response here..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <ButtonUntitled
              variant="secondary"
              onClick={() => {
                setResponseText('');
                setSelectedTemplate(null);
              }}
            >
              Clear
            </ButtonUntitled>
            <ButtonUntitled onClick={handleResponseSubmit} disabled={!responseText.trim()}>
              Save as Draft
            </ButtonUntitled>
            <ButtonUntitled onClick={handleResponseSubmit} disabled={!responseText.trim()}>
              Save and Post
            </ButtonUntitled>
          </div>
        </div>
      </CardUntitled>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-4 w-4',
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );
}
