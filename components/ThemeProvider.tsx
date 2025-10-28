"use client";

import { Theme } from "@radix-ui/themes";
import { useState, useEffect, createContext, useContext } from "react";
import { lightModeColors, darkModeColors, colorMap } from "@/lib/themeColors";

interface ThemeContextType {
  appearance: "light" | "dark";
  setAppearance: (appearance: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize appearance based on localStorage or use "inherit" to let Radix UI use system preference
  const [appearance, setAppearance] = useState<"light" | "dark" | undefined>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAppearance(() => {
      const savedMode = localStorage.getItem("darkMode");
      // Only set explicit appearance if user has manually toggled dark mode
      // Otherwise use "inherit" so Radix UI respects system preference automatically
      if (savedMode !== null) {
        return savedMode === "true" ? "dark" : "light";
      }

      // When using "inherit", still apply colors based on system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return prefersDark ? "dark" : "light";
    });
  }, []);

  // Sync appearance with DOM and listen for theme changes
  useEffect(() => {
    if (!appearance) return;
    // Apply color scheme when appearance changes
    console.log("Applying color scheme:", appearance);
    const root = document.documentElement;
    const colors = appearance === "dark" ? darkModeColors : lightModeColors;

    // Apply all colors from the constants
    Object.entries(colorMap).forEach(([cssVar, colorKey]) => {
      const colorValue = colors[colorKey as keyof typeof colors];
      root.style.setProperty(cssVar, colorValue);
    });

    // Sync with html element's data-color-mode for Radix UI
    root.setAttribute("data-color-mode", appearance);

    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "darkMode") {
        const isDark = e.newValue === "true";
        setAppearance(isDark ? "dark" : "light");
      }
    };

    // Custom event for same-tab changes
    const handleDarkModeChange = () => {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) {
        const isDark = savedMode === "true";
        setAppearance(isDark ? "dark" : "light");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("darkModeChange", handleDarkModeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("darkModeChange", handleDarkModeChange);
    };
  }, [appearance]);

  if (!appearance) {
    // Don't render until appearance is determined
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        appearance,
        setAppearance,
      }}
      key={appearance}
    >
      <Theme appearance={appearance} radius="medium" scaling="100%">
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
}
