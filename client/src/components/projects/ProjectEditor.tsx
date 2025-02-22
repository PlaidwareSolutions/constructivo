import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { insertProjectSchema } from "@db/schema";
import type { Project } from "@db/schema";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Plus, PencilIcon, ImagePlus, X, Maximize2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ProjectEditorProps {
  project?: Project;
  mode: "create" | "edit";
}

const categories = ["Residential", "Commercial", "Tenant", "Investment"];

export function ProjectEditor({ project, mode }: ProjectEditorProps) {
  const [open, setOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(project?.images || []);
  const [isDragging, setIsDragging] = useState(false);
  const [thumbnailSize, setThumbnailSize] = useState(96);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      category: project?.category || "",
      featured: project?.featured || false,
      images: project?.images || [],
    },
  });

  const onSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      // Ensure we have at least one image
      if (imageUrls.length === 0) {
        toast({
          variant: "destructive",
          title: "Missing images",
          description: "Please upload at least one image for the project.",
        });
        return;
      }

      const formData = {
        ...values,
        images: imageUrls,
      };

      console.log('Submitting form data:', formData);

      const response = await fetch(
        `/api/projects${mode === "edit" && project ? `/${project.id}` : ""}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save project");
      }

      const savedProject = await response.json();
      console.log('Project saved:', savedProject);

      // Force refetch instead of just invalidating
      await queryClient.refetchQueries({ queryKey: ["/api/projects"] });

      toast({
        title: `Project ${mode === "create" ? "created" : "updated"} successfully`,
        description: `The project "${values.title}" has been ${
          mode === "create" ? "created" : "updated"
        }.`,
      });

      setOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        variant: "destructive",
        title: `Failed to ${mode} project`,
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload only image files.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate grid columns based on thumbnail size
  const gridCols = Math.floor(600 / (thumbnailSize + 8)); // 600px is approximate container width

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={mode === "create" ? "default" : "ghost"}
          size={mode === "create" ? "default" : "icon"}
          className={mode === "edit" ? "z-10 bg-background/80 hover:bg-background/90" : ""}
        >
          {mode === "create" ? (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </>
          ) : (
            <PencilIcon className="h-4 w-4" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[60%] max-w-[60%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add Project" : "Edit Project"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new construction project to your portfolio."
              : "Make changes to your existing project."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Modern Luxury Home" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A stunning 5,000 sq ft modern residence..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Images</FormLabel>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                  "cursor-pointer"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <p className="text-sm font-medium">
                    Drag & drop images here or click to browse
                  </p>
                  <p className="text-xs">
                    Supports: JPG, PNG, GIF (Max 10MB each)
                  </p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
              </div>

              {imageUrls.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Thumbnail Size ({thumbnailSize}px)</FormLabel>
                      <div className="w-[200px]">
                        <Slider
                          value={[thumbnailSize]}
                          onValueChange={(value) => setThumbnailSize(value[0])}
                          min={48}
                          max={160}
                          step={8}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(auto-fill, minmax(${thumbnailSize}px, 1fr))`
                    }}
                  >
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square"
                        style={{
                          width: `${thumbnailSize}px`,
                          height: `${thumbnailSize}px`
                        }}
                      >
                        <img
                          src={url}
                          alt={`Project image ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <Maximize2 className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <div className="relative aspect-video">
                                <img
                                  src={url}
                                  alt={`Project image ${index + 1}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Featured Project</FormLabel>
                    <FormDescription>
                      Featured projects appear prominently on the homepage
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                "Saving..."
              ) : (
                mode === "create" ? "Create Project" : "Save Changes"
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}