import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { useState, useEffect } from "react";
import { ArrowRight } from 'lucide-react';
import { SiGoogle } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/use-user";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin } = useUser();

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
    }
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // Redirect admin users to admin dashboard, others to home
      navigate(isAdmin ? '/admin' : '/', { replace: true });
    }
  }, [user, isAdmin, navigate]);

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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}