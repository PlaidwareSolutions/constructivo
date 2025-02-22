import { Mic, MicOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useVoiceNavigation } from '@/hooks/use-voice-navigation';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceNavigationProps {
  className?: string;
}

export function VoiceNavigation({ className }: VoiceNavigationProps) {
  const { isListening, startListening, isSupported } = useVoiceNavigation();

  if (!isSupported) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative",
              isListening && "text-primary",
              className
            )}
            onClick={startListening}
            aria-label={isListening ? "Stop voice navigation" : "Start voice navigation"}
          >
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="mic-on"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Mic className="h-5 w-5 animate-pulse" />
                </motion.div>
              ) : (
                <motion.div
                  key="mic-off"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <MicOff className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isListening && (
                <motion.div 
                  className="absolute -top-1 -right-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[300px]">
          <div className="text-sm">
            <p className="font-semibold mb-1">Voice Navigation (Alt+V)</p>
            <p className="mb-2">Click or press Alt+V to start voice commands</p>
            <p className="text-xs text-muted-foreground">
              Available commands:
              <br />
              • Navigation: "go home", "show projects", "show services"
              <br />
              • Theme: "toggle theme", "dark mode", "light mode"
              <br />
              • Projects: "next project", "previous project"
              <br />
              • Scrolling: "scroll up", "scroll down"
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}