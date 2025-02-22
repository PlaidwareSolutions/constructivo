import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

type Theme = {
  primary: string;
  variant: 'professional' | 'tint' | 'vibrant';
  appearance: 'light' | 'dark';
  radius: number;
};

type Settings = {
  id: number;
  theme: Theme;
  createdAt: string;
  updatedAt: string;
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const defaultTheme: Theme = {
  primary: "hsl(222.2 47.4% 11.2%)",
  variant: "professional",
  appearance: "light",
  radius: 0.5,
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => undefined,
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Fetch theme from settings
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // Update theme in database
  const mutation = useMutation({
    mutationFn: async (newTheme: Theme) => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update theme");
      return res.json();
    },
  });

  // Update theme from settings
  useEffect(() => {
    if (settings?.theme) {
      setThemeState(settings.theme);
    }
  }, [settings]);

  // Apply theme changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme.appearance === "dark");
    // Store in localStorage for faster initial load
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  // Load theme from localStorage on initial render
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) {
      try {
        const parsedTheme = JSON.parse(stored);
        setThemeState(parsedTheme);
      } catch (e) {
        console.error('Failed to parse stored theme:', e);
      }
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    mutation.mutate(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}