// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIntegration } from '../lib/queries';
import { useCreateConnection } from '../lib/queries';
import { initiateOAuth } from '../lib/oauth';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { ProgressStepper } from '@/components/ui/progress-stepper';

type WizardStep = 'select' | 'auth' | 'configure' | 'complete';

export const ConnectionWizard: React.FC = () => {
  const { integrationId } = useParams<{ integrationId: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const { data: integration, isLoading } = useIntegration(integrationId);
  const createConnection = useCreateConnection();

  const [step, setStep] = useState<WizardStep>('auth');
  const [connectionName, setConnectionName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const steps = [
    { id: 'select', label: 'Select Integration', status: 'completed' },
    { id: 'auth', label: 'Authenticate', status: step === 'auth' ? 'current' : step === 'configure' || step === 'complete' ? 'completed' : 'pending' },
    { id: 'configure', label: 'Configure', status: step === 'configure' ? 'current' : step === 'complete' ? 'completed' : 'pending' },
    { id: 'complete', label: 'Complete', status: step === 'complete' ? 'current' : 'pending' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-secondary">Integration not found</p>
          <ButtonUntitled onClick={() => navigate('/integrations/registry')} className="mt-4">
            Back to Registry
          </ButtonUntitled>
        </div>
      </div>
    );
  }

  const handleOAuthConnect = async () => {
    if (!currentOrganization?.id) {
      setError('No organization selected');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const authUrl = await initiateOAuth(
        integration.id,
        currentOrganization.id,
        `/integrations/new/${integration.id}`
      );
      window.location.href = authUrl;
    } catch (err) {
      setError((err as Error).message);
      setIsConnecting(false);
    }
  };

  const handleAPIKeyConnect = async () => {
    if (!currentOrganization?.id || !apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await createConnection.mutateAsync({
        organization_id: currentOrganization.id,
        integration_id: integration.id,
        name: connectionName || `${integration.name} Connection`,
        credentials: {
          api_key: apiKey,
        },
      });

      setStep('complete');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };

  const renderAuthStep = () => {
    if (integration.authType === 'oauth') {
      return (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {typeof integration.icon === 'string' ? (
                <img src={integration.icon} alt={integration.name} className="w-8 h-8" />
              ) : (
                React.createElement(integration.icon as any, { className: 'w-8 h-8 text-primary' })
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect to {integration.name}</h3>
            <p className="text-text-secondary">
              You'll be redirected to {integration.name} to authorize FlowStack
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          <ButtonUntitled
            onClick={handleOAuthConnect}
            disabled={isConnecting}
            className="w-full"
            size="lg"
          >
            {isConnecting ? 'Connecting...' : `Connect to ${integration.name}`}
          </ButtonUntitled>

          <ButtonUntitled
            variant="outline"
            onClick={() => navigate('/integrations/registry')}
            className="w-full"
          >
            Cancel
          </ButtonUntitled>
        </div>
      );
    }

    if (integration.authType === 'api_key') {
      return (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {typeof integration.icon === 'string' ? (
                <img src={integration.icon} alt={integration.name} className="w-8 h-8" />
              ) : (
                React.createElement(integration.icon as any, { className: 'w-8 h-8 text-primary' })
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">Enter your {integration.name} API Key</h3>
            <p className="text-text-secondary">
              Find your API key in your {integration.name} account settings
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="connectionName">Connection Name (Optional)</label>
              <InputUntitled
                id="connectionName"
                placeholder="Production Stripe"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="apiKey">API Key *</label>
              <InputUntitled
                id="apiKey"
                type="password"
                placeholder="sk_live_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>

          <ButtonUntitled
            onClick={handleAPIKeyConnect}
            disabled={isConnecting || !apiKey.trim()}
            className="w-full"
            size="lg"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </ButtonUntitled>

          <ButtonUntitled
            variant="outline"
            onClick={() => navigate('/integrations/registry')}
            className="w-full"
          >
            Cancel
          </ButtonUntitled>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <p className="text-text-secondary">
          This integration uses a custom authentication method. Please contact support.
        </p>
      </div>
    );
  };

  const renderCompleteStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Connection Successful!</h3>
      <p className="text-text-secondary mb-6">
        Your {integration.name} integration is now connected and ready to use.
      </p>

      <div className="flex gap-2 justify-center">
        <ButtonUntitled
          onClick={() => navigate(`/integrations`)}
          variant="outline"
        >
          View Connections
        </ButtonUntitled>
        <ButtonUntitled
          onClick={() => navigate('/integrations/registry')}
        >
          Connect More
        </ButtonUntitled>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-8">
        <ProgressStepper steps={steps} />
      </div>

      {/* Content */}
      <CardUntitled className="p-6">
        {step === 'auth' && renderAuthStep()}
        {step === 'configure' && (
          <div className="text-center py-8">
            <p>Configuration options will be added here.</p>
            <ButtonUntitled onClick={() => setStep('complete')} className="mt-4">
              Complete
            </ButtonUntitled>
          </div>
        )}
        {step === 'complete' && renderCompleteStep()}
      </CardUntitled>
    </div>
  );
};
