import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { NAVIGATION } from '@/lib/constants';

// Voice command mappings
const COMMANDS: Record<string, string> = {
  'go home': '/',
  'show projects': '/projects',
  'view projects': '/projects',
  'show services': '/services',
  'view services': '/services',
  'dark mode': 'toggle-theme',
  'light mode': 'toggle-theme',
  'toggle theme': 'toggle-theme',
  'next project': 'next-project',
  'previous project': 'prev-project',
  'scroll down': 'scroll-down',
  'scroll up': 'scroll-up',
};

export function useVoiceNavigation() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Initialize speech recognition
  const recognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      return recognition;
    }
    return null;
  }, []);

  // Handle voice commands
  const handleCommand = useCallback((command: string) => {
    const normalizedCommand = command.toLowerCase().trim();

    // Check if command exists in our mapping
    const destination = COMMANDS[normalizedCommand];
    if (!destination) {
      toast({
        title: "Command not recognized",
        description: `Try saying: ${Object.keys(COMMANDS).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Handle special commands
    switch (destination) {
      case 'toggle-theme':
        setTheme({
          ...theme,
          appearance: theme.appearance === 'dark' ? 'light' : 'dark'
        });
        toast({
          title: "Theme toggled",
          description: `Switched to ${theme.appearance === 'dark' ? 'light' : 'dark'} mode`,
        });
        break;

      case 'scroll-down':
        window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' });
        break;

      case 'scroll-up':
        window.scrollBy({ top: -window.innerHeight / 2, behavior: 'smooth' });
        break;

      case 'next-project':
      case 'prev-project':
        const projectCards = document.querySelectorAll('[role="article"]');
        if (projectCards.length > 0) {
          const currentCard = document.activeElement?.closest('[role="article"]');
          const currentIndex = Array.from(projectCards).indexOf(currentCard as Element);
          const newIndex = destination === 'next-project' 
            ? (currentIndex + 1) % projectCards.length
            : (currentIndex - 1 + projectCards.length) % projectCards.length;
          (projectCards[newIndex] as HTMLElement)?.focus();
        }
        break;

      default:
        // Handle navigation
        if (location.pathname !== destination) {
          navigate(destination);
          toast({
            title: "Navigating",
            description: `Going to ${destination}`,
          });
        }
    }
  }, [navigate, location, toast, theme, setTheme]);

  const startListening = useCallback(() => {
    const recognitionInstance = recognition();
    if (!recognitionInstance) {
      setIsSupported(false);
      toast({
        title: "Not supported",
        description: "Voice navigation is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    recognitionInstance.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening",
        description: "Say a command...",
      });
    };

    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      handleCommand(transcript);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Error",
        description: event.error === 'not-allowed' 
          ? "Please allow microphone access to use voice commands"
          : "Failed to recognize voice command",
        variant: "destructive",
      });
    };

    recognitionInstance.start();
  }, [recognition, handleCommand, toast]);

  // Add keyboard shortcut (Alt+V) to toggle voice recognition
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        if (!isListening) {
          startListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, startListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      const recognitionInstance = recognition();
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [recognition]);

  return {
    isListening,
    transcript,
    startListening,
    isSupported,
  };
}