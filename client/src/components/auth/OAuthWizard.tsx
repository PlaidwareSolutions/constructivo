import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OAuthFlowchart } from "./OAuthFlowchart";
import { OAuthRecommendations } from "./OAuthRecommendations";
import { DomainVerifier } from './DomainVerifier';

interface Step {
  id: string;
  title: string;
  description: string;
  checkpoints: Checkpoint[];
}

interface Checkpoint {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  errorMessage?: string;
}

const steps: Step[] = [
  {
    id: 'credentials',
    title: 'Check OAuth Credentials',
    description: 'Verify your Google OAuth credentials are properly configured.',
    checkpoints: [
      {
        id: 'client-id',
        title: 'Client ID',
        description: 'Check if Client ID is properly set in environment variables',
        status: 'pending'
      },
      {
        id: 'client-secret',
        title: 'Client Secret',
        description: 'Verify Client Secret is properly configured',
        status: 'pending'
      }
    ]
  },
  {
    id: 'callback',
    title: 'Domain Configuration',
    description: 'Configure your domains and callback URLs in Google Cloud Console.',
    checkpoints: [
      {
        id: 'callback-url',
        title: 'OAuth Client Configuration',
        description: 'Add your callback URL to OAuth 2.0 Client IDs > Web client > Authorized redirect URIs',
        status: 'pending'
      },
      {
        id: 'authorized-domain',
        title: 'Domain Authorization',
        description: 'Add "repl.co" to OAuth consent screen > Authorized domains',
        status: 'pending'
      }
    ]
  },
  {
    id: 'api',
    title: 'OAuth Consent Screen',
    description: 'Configure OAuth consent screen and verify test user access.',
    checkpoints: [
      {
        id: 'oauth-consent',
        title: 'App Configuration',
        description: 'Configure app name and authorized domains in OAuth consent screen',
        status: 'pending'
      },
      {
        id: 'test-users',
        title: 'Test Users',
        description: 'If using External user type, add your email under "Test users"',
        status: 'pending'
      }
    ]
  }
];

export function OAuthWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<Record<string, Record<string, Checkpoint>>>(
    steps.reduce((acc, step) => ({
      ...acc,
      [step.id]: step.checkpoints.reduce((checkpointAcc, checkpoint) => ({
        ...checkpointAcc,
        [checkpoint.id]: checkpoint
      }), {})
    }), {})
  );

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error) {
      // Update the OAuth consent screen checkpoint status if there's an error
      updateCheckpointStatus(
        'api',
        'oauth-consent',
        'error',
        decodeURIComponent(error)
      );
    }
  }, []);

  const updateCheckpointStatus = (
    stepId: string,
    checkpointId: string,
    status: Checkpoint['status'],
    errorMessage?: string
  ) => {
    setStepStatuses(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [checkpointId]: {
          ...prev[stepId][checkpointId],
          status,
          errorMessage
        }
      }
    }));
  };

  const checkCredentials = async () => {
    // Check Client ID
    updateCheckpointStatus('credentials', 'client-id', 'checking');
    try {
      const response = await fetch('/api/auth/check-credentials');
      const data = await response.json();

      updateCheckpointStatus(
        'credentials',
        'client-id',
        data.clientId ? 'success' : 'error',
        !data.clientId ? 'Client ID is missing or invalid' : undefined
      );

      // Check Client Secret
      updateCheckpointStatus('credentials', 'client-secret', 'checking');
      updateCheckpointStatus(
        'credentials',
        'client-secret',
        data.clientSecret ? 'success' : 'error',
        !data.clientSecret ? 'Client Secret is missing or invalid' : undefined
      );
    } catch (error) {
      updateCheckpointStatus('credentials', 'client-id', 'error', 'Failed to check credentials');
      updateCheckpointStatus('credentials', 'client-secret', 'error', 'Failed to check credentials');
    }
  };

  const checkCallback = async () => {
    updateCheckpointStatus('callback', 'callback-url', 'checking');
    try {
      const response = await fetch('/api/auth/check-callback');
      const data = await response.json();

      // Check domain structure first
      if (!data.details?.domainValid || !data.details?.domainStructureValid) {
        updateCheckpointStatus(
          'callback',
          'callback-url',
          'error',
          `Invalid domain structure. Expected format: your-repl.your-username.repl.co, got: ${data.domain}`
        );
        return;
      }

      updateCheckpointStatus(
        'callback',
        'callback-url',
        data.callbackUrl ? 'success' : 'error',
        !data.callbackUrl ? `Add this callback URL: ${data.currentCallback}` : undefined
      );

      updateCheckpointStatus('callback', 'authorized-domain', 'checking');
      updateCheckpointStatus(
        'callback',
        'authorized-domain',
        data.authorizedDomain ? 'success' : 'error',
        !data.authorizedDomain ? `Add this domain to authorized domains: ${data.domain}` : undefined
      );
    } catch (error) {
      updateCheckpointStatus('callback', 'callback-url', 'error', 'Failed to check callback configuration');
      updateCheckpointStatus('callback', 'authorized-domain', 'error', 'Failed to check authorized domains');
    }
  };

  const checkAPI = async () => {
    updateCheckpointStatus('api', 'oauth-consent', 'checking');
    try {
      const response = await fetch('/api/auth/check-api');
      const data = await response.json();

      // Add the URLs to the checkpoint descriptions
      const authorizedOrigin = data.details?.authorizedOrigin;
      const authorizedRedirect = data.details?.authorizedRedirect;

      if (authorizedOrigin && authorizedRedirect) {
        steps[1].checkpoints[0].description = `Add this URL to Authorized redirect URIs: ${authorizedRedirect}`;
        steps[1].checkpoints[1].description = `Add this URL to Authorized JavaScript origins: ${authorizedOrigin}`;
      }

      updateCheckpointStatus(
        'api',
        'oauth-consent',
        data.consentScreen ? 'success' : 'error',
        !data.consentScreen ? 'OAuth consent screen needs to be configured properly' : undefined
      );

      updateCheckpointStatus('api', 'test-users', 'checking');
      updateCheckpointStatus(
        'api',
        'test-users',
        data.testUsers ? 'success' : 'error',
        !data.testUsers ? 'Test users need to be configured properly' : undefined
      );
    } catch (error) {
      updateCheckpointStatus('api', 'oauth-consent', 'error', 'Failed to check API configuration');
      updateCheckpointStatus('api', 'test-users', 'error', 'Failed to check API status');
    }
  };

  useEffect(() => {
    const checkCurrentStep = async () => {
      switch (currentStep.id) {
        case 'credentials':
          await checkCredentials();
          break;
        case 'callback':
          await checkCallback();
          break;
        case 'api':
          await checkAPI();
          break;
      }
    };

    checkCurrentStep();
  }, [currentStep]);

  const renderStatusIcon = (status: Checkpoint['status']) => {
    switch (status) {
      case 'pending':
        return <div className="h-6 w-6 rounded-full border-2 border-muted" />;
      case 'checking':
        return (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      case 'success':
        return <Check className="h-6 w-6 text-green-500" />;
      case 'error':
        return <X className="h-6 w-6 text-red-500" />;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>OAuth Configuration Wizard</CardTitle>
        <CardDescription>
          Follow this step-by-step guide to troubleshoot your OAuth configuration.
          If you see "accounts.google.com refused to connect", make sure to complete all steps below.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center",
                  index < steps.length - 1 && "flex-1"
                )}
              >
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    index === currentStepIndex
                      ? "bg-primary"
                      : index < currentStepIndex
                      ? "bg-primary/50"
                      : "bg-muted"
                  )}
                />
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-full",
                      index < currentStepIndex
                        ? "bg-primary/50"
                        : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between px-1">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "text-xs",
                  index === currentStepIndex
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                Step {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Visual Flowchart */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">OAuth Setup Flow</h3>
          <OAuthFlowchart />
        </div>

        {/* Personalized Recommendations */}
        <div className="mb-8">
          <OAuthRecommendations />
        </div>

        {currentStep.id === 'callback' && (
          <div className="mb-8">
            <DomainVerifier />
          </div>
        )}

        {/* Current step content */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{currentStep.title}</h3>
            <p className="text-muted-foreground">{currentStep.description}</p>
          </div>

          <div className="space-y-4">
            {currentStep.checkpoints.map((checkpoint) => {
              const status = stepStatuses[currentStep.id][checkpoint.id];
              return (
                <div
                  key={checkpoint.id}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                >
                  <div className="mt-1">
                    {renderStatusIcon(status.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{checkpoint.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {checkpoint.description}
                    </p>
                    {status.status === 'error' && status.errorMessage && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>{status.errorMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button
          onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
          disabled={currentStepIndex === steps.length - 1}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}