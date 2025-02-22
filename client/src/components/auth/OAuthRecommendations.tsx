import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, CircleDot } from "lucide-react";
import { useEffect, useState } from "react";

interface ConfigStatus {
  credentials: boolean;
  domain: boolean;
  consent: boolean;
  testUsers: boolean;
}

interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "complete";
}

export function OAuthRecommendations() {
  const [status, setStatus] = useState<ConfigStatus>({
    credentials: false,
    domain: false,
    consent: false,
    testUsers: false
  });

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [domainInfo, setDomainInfo] = useState<{ domain: string; replSlug: string }>({ 
    domain: '', 
    replSlug: '' 
  });

  useEffect(() => {
    async function checkConfiguration() {
      try {
        // Check credentials
        const credResponse = await fetch('/api/auth/check-credentials');
        const credData = await credResponse.json();

        // Check domain
        const domainResponse = await fetch('/api/auth/check-callback');
        const domainData = await domainResponse.json();

        // Check API and consent screen
        const apiResponse = await fetch('/api/auth/check-api');
        const apiData = await apiResponse.json();

        setDomainInfo({
          domain: domainData.domain,
          replSlug: domainData.domain.split('.')[0]
        });

        setStatus({
          credentials: credData.clientId && credData.clientSecret,
          domain: domainData.authorizedDomain,
          consent: apiData.consentScreen,
          testUsers: apiData.testUsers
        });

        // Generate recommendations based on status
        const newRecommendations: Recommendation[] = [];

        if (!credData.clientId || !credData.clientSecret) {
          newRecommendations.push({
            title: "Configure OAuth Credentials",
            description: "Set up your Google Cloud Console credentials and add them to your environment variables.",
            priority: "high",
            status: "pending"
          });
        }

        if (!domainData.authorizedDomain) {
          newRecommendations.push({
            title: "Add Authorized Domain",
            description: `Add "repl.co" to your authorized domains in the OAuth consent screen. This will allow access from your app domain "${domainData.domain}".`,
            priority: "high",
            status: credData.clientId ? "in-progress" : "pending"
          });
        }

        if (!apiData.consentScreen) {
          newRecommendations.push({
            title: "Configure OAuth Consent Screen",
            description: `Set the app name to "${domainInfo.replSlug}" or "Construction Project Manager" and ensure "repl.co" is added to authorized domains.`,
            priority: "medium",
            status: domainData.authorizedDomain ? "in-progress" : "pending"
          });
        }

        if (!apiData.testUsers) {
          newRecommendations.push({
            title: "Add Test Users",
            description: "Add your Google account email address as a test user in the OAuth consent screen. Only test users can access the app while it's in testing mode.",
            priority: "medium",
            status: apiData.consentScreen ? "in-progress" : "pending"
          });
        }

        setRecommendations(newRecommendations);
      } catch (error) {
        console.error('Error checking OAuth configuration:', error);
      }
    }

    checkConfiguration();
  }, []);

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: Recommendation['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <CircleDot className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  if (recommendations.length === 0 && Object.values(status).every(Boolean)) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <AlertTitle>All Set!</AlertTitle>
        <AlertDescription>
          Your OAuth configuration looks good. You should be able to sign in now.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personalized Recommendations</h3>
      {recommendations.map((rec, index) => (
        <Alert key={index} className="flex items-start gap-4">
          {getStatusIcon(rec.status)}
          <div className="flex-1">
            <AlertTitle className="flex items-center gap-2">
              {rec.title}
              <span className={`text-sm ${getPriorityColor(rec.priority)}`}>
                ({rec.priority} priority)
              </span>
            </AlertTitle>
            <AlertDescription>{rec.description}</AlertDescription>
          </div>
        </Alert>
      ))}
    </div>
  );
}