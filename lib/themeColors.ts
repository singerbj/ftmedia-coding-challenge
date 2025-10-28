/**
 * Theme color configuration - Single source of truth for all theme colors
 * These values are used by both CSS and JavaScript
 */

export const lightModeColors = {
  bgPrimary: "#ffffff",
  bgSecondary: "#f5f5f5",
  textPrimary: "#171717",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  messageUserBg: "#f0f0f0",
  messageAssistantBg: "#e3f2fd",
  scrollbarTrack: "#f1f5f9",
  scrollbarThumb: "#cbd5e1",
  scrollbarThumbHover: "#a0aec0",
} as const;

export const darkModeColors = {
  bgPrimary: "#1a2540",
  bgSecondary: "#253354",
  textPrimary: "#e8eef5",
  textSecondary: "#a8b3c1",
  border: "#2a3a4d",
  messageUserBg: "#253354",
  messageAssistantBg: "#1e3a5f",
  scrollbarTrack: "#253354",
  scrollbarThumb: "#3a4a5f",
  scrollbarThumbHover: "#4a5a6f",
} as const;

export const colorMap = {
  "--color-bg-primary": "bgPrimary",
  "--color-bg-secondary": "bgSecondary",
  "--color-text-primary": "textPrimary",
  "--color-text-secondary": "textSecondary",
  "--color-border": "border",
  "--color-message-user-bg": "messageUserBg",
  "--color-message-assistant-bg": "messageAssistantBg",
  "--color-scrollbar-track": "scrollbarTrack",
  "--color-scrollbar-thumb": "scrollbarThumb",
  "--color-scrollbar-thumb-hover": "scrollbarThumbHover",
} as const;
