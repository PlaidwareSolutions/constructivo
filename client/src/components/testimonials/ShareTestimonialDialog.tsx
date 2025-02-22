import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTestimonialSchema } from "@db/schema";
import type { NewTestimonial } from "@db/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TestimonialForm } from "./TestimonialForm";

export function ShareTestimonialDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<NewTestimonial>({
    resolver: zodResolver(insertTestimonialSchema),
    defaultValues: {
      name: "",
      role: "",
      content: "",
    },
  });

  const onSubmit = async (values: NewTestimonial) => {
    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit testimonial");
      }

      toast({
        title: "Thank you for your testimonial!",
        description: "Your testimonial has been submitted for review.",
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit testimonial",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          Share Your Experience
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
          <DialogDescription>
            Tell us about your experience working with us. Your feedback helps us improve and shows
            others what they can expect.
          </DialogDescription>
        </DialogHeader>
        <TestimonialForm form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
