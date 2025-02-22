import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Project } from "@db/schema";
import { cn } from "@/lib/utils";
import { EmojiReactions } from "@/components/shared/EmojiReactions";
import { SocialShare } from "@/components/shared/SocialShare";
import { ImageCarousel } from "./ImageCarousel";
import { ProjectEditor } from "./ProjectEditor";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface ProjectCardProps {
  project: Project;
  className?: string;
  children?: React.ReactNode;
  isAdmin?: boolean;
}

export function ProjectCard({
  project,
  className,
  children,
  isAdmin,
}: ProjectCardProps) {
  const queryClient = useQueryClient();
  const shareUrl = `${window.location.origin}/projects/${project.id}`;
  const { toast } = useToast();

  const handleDelete = async (projectId: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden group h-full flex flex-col relative",
        className,
      )}
      role="article"
      aria-label={`${project.title} project`}
    >
      <div className="relative">
        <ImageCarousel images={project.images} title={project.title} />
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="flex justify-between items-center">
            <div>
              {isAdmin && <ProjectEditor mode="edit" project={project} />}
            </div>
            <div className="flex gap-2">
              <SocialShare
                url={shareUrl}
                title={project.title}
                description={project.description}
                imageUrl={project.images[0]}
                projectId={project.id}
                className="z-10 bg-background/80 hover:bg-background/90"
              />
            </div>
          </div>
        </div>
      </div>

      <CardContent className="flex-grow p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold line-clamp-1">
            {project.title}
          </h3>
          <Badge
            variant={project.featured ? "default" : "secondary"}
            className="ml-2 flex-shrink-0"
            aria-label={`Project category: ${project.category}`}
          >
            {project.category}
          </Badge>
        </div>
        <p className="text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>

        <EmojiReactions projectId={project.id} />
      </CardContent>
    </Card>
  );
}