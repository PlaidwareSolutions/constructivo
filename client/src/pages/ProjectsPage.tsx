import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectEditor } from '@/components/projects/ProjectEditor';
import { META_DEFAULTS, COMPANY_NAME } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Project } from '@db/schema';
import { Loader2, Search } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

const categories = ["All", "Residential", "Commercial", "Tenant", "Investment"];
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "title-desc", label: "Title Z-A" },
];

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to fetch user');
      }
      return response.json();
    }
  });

  const isAdmin = user?.isAdmin ?? false;

  const filteredAndSortedProjects = useMemo(() => {
    return projects
      .filter((project) => {
        const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) ||
                              project.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "All" || 
                                project.category.toLowerCase() === category.toLowerCase();
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sort) {
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "title-asc":
            return a.title.localeCompare(b.title);
          case "title-desc":
            return b.title.localeCompare(a.title);
          default:
            return 0;
        }
      });
  }, [projects, search, category, sort]);

  const handleProjectCreated = useCallback(() => {
    // Force an immediate refetch
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  }, [queryClient]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Failed to load projects</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <Helmet>
        <title>Projects - {COMPANY_NAME}</title>
        <meta name="description" content="Explore our portfolio of successful construction projects, from luxury homes to commercial buildings." />
        <meta name="keywords" content="construction portfolio, building projects, completed constructions, luxury homes, commercial buildings" />

        {/* Open Graph tags */}
        <meta property="og:title" content={`Projects - ${COMPANY_NAME}`} />
        <meta property="og:description" content="Explore our portfolio of successful construction projects, from luxury homes to commercial buildings." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={META_DEFAULTS.og.image} />
        <meta property="og:site_name" content={META_DEFAULTS.og.siteName} />
        <meta property="og:url" content={window.location.href} />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Projects - ${COMPANY_NAME}`} />
        <meta name="twitter:description" content="Explore our portfolio of successful construction projects, from luxury homes to commercial buildings." />
        <meta name="twitter:image" content={META_DEFAULTS.og.image} />

        {/* Schema.org markup for better SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `Projects - ${COMPANY_NAME}`,
            "description": "Explore our portfolio of successful construction projects, from luxury homes to commercial buildings.",
            "url": window.location.href,
            "image": META_DEFAULTS.og.image,
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Our Projects</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our portfolio of exceptional construction projects, showcasing
              our commitment to quality and innovation.
            </p>
          </div>
        </ScrollReveal>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <ProjectEditor mode="create" onProjectCreated={handleProjectCreated} />
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredAndSortedProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProjectCard project={project} isAdmin={isAdmin} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}