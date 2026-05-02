import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyOAuthState, exchangeCodeForTokens, saveOAuthConnection } from '../lib/oauth';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle errors from OAuth provider
      if (error) {
        setStatus('error');
        setError(errorDescription || error);
        return;
      }

      // Verify state parameter
      if (!state) {
        setStatus('error');
        setError('Invalid OAuth callback: missing state parameter');
        return;
      }

      const oauthState = verifyOAuthState(state);
      if (!oauthState) {
        setStatus('error');
        setError('Invalid OAuth callback: state verification failed');
        return;
      }

      // Exchange code for tokens
      if (!code) {
        setStatus('error');
        setError('Invalid OAuth callback: missing authorization code');
        return;
      }

      try {
        const tokens = await exchangeCodeForTokens(oauthState.provider, code);

        // Save connection to database
        if (!currentOrganization?.id) {
          throw new Error('No organization found');
        }

        await saveOAuthConnection(
          currentOrganization.id,
          oauthState.provider,
          tokens,
          undefined // Use default name
        );

        setStatus('success');

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(oauthState.redirect_to || '/integrations');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setError((err as Error).message);
      }
    };

    handleCallback();
  }, [searchParams, currentOrganization, navigate]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connecting...</h2>
          <p className="text-text-secondary">
            Please wait while we complete the connection
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connection Successful!</h2>
          <p className="text-text-secondary mb-4">
            Your integration has been connected successfully.
          </p>
          <p className="text-sm text-text-secondary">
            Redirecting you back...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
        <p className="text-text-secondary mb-6">
          {error || 'An error occurred while connecting the integration.'}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate('/integrations')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Back to Integrations
          </button>
          <button
            onClick={() => navigate('/integrations/registry')}
            className="px-4 py-2 border border-border rounded-lg hover:bg-surface-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
