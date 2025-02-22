import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerificationResult {
  isValid: boolean;
  domain: string;
  authorizedDomain: boolean;
  callbackUrl: string;
  details: {
    domainValid: boolean;
    domainStructureValid: boolean;
    domainParts: string[];
  };
}

export function DomainVerifier() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const verifyDomain = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/check-callback');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error verifying domain:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Verification</CardTitle>
        <CardDescription>
          Verify your domain configuration for Google OAuth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={verifyDomain}
            disabled={isVerifying}
            className="w-full"
          >
            {isVerifying ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Verify Domain Configuration'
            )}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  {result.authorizedDomain ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {result.authorizedDomain
                      ? 'Domain Configuration Valid'
                      : 'Domain Configuration Invalid'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current domain: {result.domain}
                  </p>
                </div>
              </div>

              {!result.authorizedDomain && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Required Actions:</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>
                      Add "repl.co" to your OAuth consent screen's authorized domains
                    </li>
                    <li>
                      Verify your callback URL is set to:{' '}
                      <code className="px-1 py-0.5 bg-muted rounded">
                        {result.callbackUrl}
                      </code>
                    </li>
                    {!result.details.domainStructureValid && (
                      <li className="text-destructive">
                        Invalid domain structure. Expected format: your-repl.your-username.repl.co
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
