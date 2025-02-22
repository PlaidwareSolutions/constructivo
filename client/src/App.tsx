import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useUser } from "./hooks/use-user";
import { WelcomeScreen } from "@/components/shared/WelcomeScreen";
import AuthPage from "./pages/AuthPage";

// Lazy load page components
const HomePage = lazy(() => import("./pages/HomePage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <HelmetProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <WelcomeScreen />
              <header>
                <Header />
              </header>
              <main className="flex-grow">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route
                      path="/admin"
                      element={
                        <RequireAdmin>
                          <AdminDashboard />
                        </RequireAdmin>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <footer>
                <Footer />
              </footer>
            </div>
            <Toaster />
          </BrowserRouter>
        </HelmetProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Protected route component for admin pages
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin } = useUser();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// 404 Not Found page
function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center">
      <article className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="text-primary hover:underline"
        >
          Go back home
        </a>
      </article>
    </section>
  );
}

export default App;