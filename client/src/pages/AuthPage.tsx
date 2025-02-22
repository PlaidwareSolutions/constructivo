import { Button } from "@/components/ui/button";
import { OAuthWizard } from "@/components/auth/OAuthWizard";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { useState, useEffect } from "react";
import { ArrowRight, HelpCircle } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for error in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: decodeURIComponent(error)
      });
      setShowWizard(true);
    }
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = '/auth/google';
  };

  return (
    <>
      <AnimatePresence>
        <LoadingScreen show={isLoading} />
      </AnimatePresence>

      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          {!showWizard ? (
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Sign in to access your construction project dashboard and manage your projects.
              </p>

              <div className="space-y-4">
                <Button
                  size="lg"
                  className="w-full max-w-sm mx-auto flex items-center justify-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <SiGoogle className="h-4 w-4" />
                  Continue with Google
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowWizard(true)}
                  disabled={isLoading}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Having trouble signing in?
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWizard(false)}
                className="mb-4"
              >
                ← Back to Sign In
              </Button>
              <OAuthWizard />
            </div>
          )}
        </div>
      </div>
    </>
  );
}