import { useQuery } from "@tanstack/react-query";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Project } from "@db/schema";

export function Projects() {
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const featuredProjects = projects
    ?.filter((p) => p.featured)
    .slice(0, 3) ?? [];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our latest and most impressive construction projects,
            showcasing our commitment to excellence and innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/projects">
            <Button size="lg">View All Projects</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}