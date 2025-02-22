import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { VoiceNavigation } from "@/components/shared/VoiceNavigation";
import { useUser } from "@/hooks/use-user";
import { COMPANY_NAME, NAVIGATION } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const { user, logout, isAdmin } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close mobile menu when pressing Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between" aria-label="Main navigation">
          <Link 
            to="/" 
            className="text-2xl font-bold"
            aria-label={`${COMPANY_NAME} - Return to homepage`}
          >
            {COMPANY_NAME}
          </Link>

          <div className="hidden md:flex md:gap-x-8" role="menubar">
            {NAVIGATION.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  "text-muted-foreground"
                )}
                role="menuitem"
                aria-label={item.name}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <VoiceNavigation />
            <ModeToggle />

            {user ? (
              <>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/admin")}
                    aria-label="Go to admin dashboard"
                  >
                    Dashboard
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  onClick={() => logout()}
                  aria-label="Log out of your account"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                aria-label="Sign in to your account"
              >
                Sign In
              </Button>
            )}

            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden"
            aria-label="Mobile navigation"
          >
            <div 
              className="space-y-1 px-4 pb-3 pt-2"
              role="menu"
              aria-orientation="vertical"
            >
              {NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => setMobileMenuOpen(false)}
                  role="menuitem"
                  aria-label={item.name}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}