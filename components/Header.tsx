"use client";

import { useState } from "react";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { HamburgerMenuIcon, Cross1Icon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "./ThemeProvider";

interface HeaderProps {
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { appearance, setAppearance } = useTheme();
  const isDarkMode = appearance === "dark";

  const toggleDarkMode = () => {
    const newAppearance = isDarkMode ? "light" : "dark";
    setAppearance(newAppearance);
    localStorage.setItem("darkMode", String(newAppearance === "dark"));
    // Dispatch custom event for ThemeProvider
    window.dispatchEvent(new Event("darkModeChange"));
  };

  const handleMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMobileMenuToggle?.(newState);
  };

  return (
    <Box className="border-b border-color-primary bg-color-primary sticky top-0 z-50 flex items-center">
      <Flex justify="between" align="center" p="4" className="w-full">
        {/* Logo / Brand */}
        <Flex align="center" gap="1">
          <div className="px-2 py-1 rounded-lg bg-linear-to-br from-blue-500 to-blue-800 flex items-center justify-center text-white font-bold text-lg">
            FTM
          </div>
          <Heading as="h1" size="6" className="m-0">
            Chat
          </Heading>
        </Flex>

        {/* Dark Mode Toggle & Mobile Menu Buttons */}
        <Flex gap="2" align="center">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center bg-none border-0 cursor-pointer p-2 hover:bg-color-secondary rounded transition-colors"
            aria-label="Toggle dark mode"
            title={isDarkMode ? "Light mode" : "Dark mode"}
          >
            {isDarkMode ? (
              <SunIcon width={24} height={24} />
            ) : (
              <MoonIcon width={24} height={24} />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={handleMenuToggle}
            className="md:hidden flex items-center justify-center bg-none border-0 cursor-pointer p-2 hover:bg-color-secondary rounded transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <Cross1Icon width={24} height={24} />
            ) : (
              <HamburgerMenuIcon width={24} height={24} />
            )}
          </button>
        </Flex>
      </Flex>
    </Box>
  );
}
