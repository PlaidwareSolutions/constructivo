import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Reaction } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

const EMOJIS = ["👍", "❤️", "🎉", "👏", "🌟"];

interface EmojiReactionsProps {
  projectId: number;
}

export function EmojiReactions({ projectId }: EmojiReactionsProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get or create session ID
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("reactionSessionId");
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem("reactionSessionId", newId);
    return newId;
  });

  // Fetch reactions for this project
  const { data: reactions = [] } = useQuery<Reaction[]>({
    queryKey: [`/api/projects/${projectId}/reactions`],
  });

  // Add reaction mutation
  const addReaction = useMutation({
    mutationFn: async (emoji: string) => {
      const res = await fetch(`/api/projects/${projectId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ emoji, sessionId }),
      });

  if (!res.ok) {
    throw new Error("Failed to add reaction");
  }
  return res.json();
  },
  onMutate: async (emoji) => {
  await queryClient.cancelQueries({
    queryKey: [`/api/projects/${projectId}/reactions`],
  });

  const previousReactions = queryClient.getQueryData<Reaction[]>([
    `/api/projects/${projectId}/reactions`,
  ]) || [];

  const optimisticReaction = {
    id: Date.now(),
    projectId,
    emoji,
    sessionId,
    createdAt: new Date().toISOString(),
  };

  queryClient.setQueryData<Reaction[]>(
    [`/api/projects/${projectId}/reactions`],
    [...previousReactions, optimisticReaction],
  );

  return { previousReactions };
  },
  onError: (err, _, context) => {
  if (context?.previousReactions) {
    queryClient.setQueryData(
      [`/api/projects/${projectId}/reactions`],
      context.previousReactions,
    );
  }
  toast({
    title: "Could not add reaction",
    description: err.message,
    variant: "destructive",
  });
  },
  onSuccess: () => {
  toast({
    title: "Reaction added!",
    description: "Thanks for sharing your reaction.",
  });
  },
  });

  // Get reaction counts for each emoji
  const reactionCounts = EMOJIS.reduce(
    (acc, emoji) => {
      acc[emoji] = reactions.filter((r) => r.emoji === emoji).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Check if user has already reacted
  const hasReacted = reactions.some((r) => r.sessionId === sessionId);
  const userReaction = reactions.find((r) => r.sessionId === sessionId)?.emoji;

  return (
    <div className="flex gap-2 items-center justify-center my-4">
      <AnimatePresence>
        {EMOJIS.map((emoji) => {
          const count = reactionCounts[emoji];
          const isSelected = userReaction === emoji;

          return (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative p-2 rounded-full transition-colors
                ${
                  hasReacted
                    ? isSelected
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "opacity-50 cursor-not-allowed"
                    : "hover:bg-secondary/10"
                }
              `}
              onClick={() => {
                if (!hasReacted) {
                  setSelectedEmoji(emoji);
                  addReaction.mutate(emoji);
                }
              }}
              disabled={hasReacted && !isSelected}
              aria-label={`React with ${emoji}`}
            >
              <span className="text-xl">{emoji}</span>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5"
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
