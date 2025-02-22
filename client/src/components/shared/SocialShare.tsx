import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Share2, Check } from "lucide-react";
import { SiFacebook, SiX, SiLinkedin, SiPinterest } from "react-icons/si";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  className?: string;
  projectId?: number;
}

export function SocialShare({
  url,
  title,
  description,
  imageUrl,
  className,
  projectId,
}: SocialShareProps) {
  const [showCopied, setShowCopied] = useState(false);

  // Fetch project snapshot data if projectId is provided
  const { data: snapshot } = useQuery({
    queryKey: [`/api/projects/${projectId}/snapshot`],
    enabled: !!projectId,
  });

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(snapshot?.title || title);
  const encodedDesc = encodeURIComponent(snapshot?.description || description);
  const encodedImage = encodeURIComponent(snapshot?.image || imageUrl || "");

  const shareLinks = [
    {
      name: "Facebook",
      icon: SiFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:text-[#1877F2]",
    },
    {
      name: "X (Twitter)",
      icon: SiX,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:text-[#000000] dark:hover:text-white",
    },
    {
      name: "LinkedIn",
      icon: SiLinkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:text-[#0A66C2]",
    },
    {
      name: "Pinterest",
      icon: SiPinterest,
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDesc}&media=${encodedImage}`,
      color: "hover:text-[#E60023]",
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-foreground hover:text-foreground/90",
            "dark:text-white dark:hover:text-white",
            "bg-background/80 hover:bg-background/90",
            className
          )}
          aria-label="Share this project"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Share2 className="h-4 w-4" />
          </motion.div>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-[280px] p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Share this project</h4>
          </div>

          {snapshot ? (
            <div className="rounded-lg border bg-card p-2 text-xs text-muted-foreground">
              <p className="line-clamp-2 font-medium text-foreground">
                {snapshot.title}
              </p>
              <p className="line-clamp-2 mt-1">{snapshot.description}</p>
              <p className="mt-1">
                {snapshot.imageCount} photos • {snapshot.category}
              </p>
            </div>
          ) : null}

          <div className="flex gap-2 justify-between">
            {shareLinks.map((platform) => (
              <motion.a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "p-2 rounded-full transition-colors",
                  "hover:bg-secondary",
                  platform.color,
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Share on ${platform.name}`}
              >
                <platform.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-full relative text-foreground hover:bg-accent dark:text-foreground dark:hover:bg-accent/80"
              onClick={copyToClipboard}
            >
              <AnimatePresence mode="wait">
                {showCopied ? (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    Copy Link
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}