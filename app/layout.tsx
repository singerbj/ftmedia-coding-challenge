"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedMode = localStorage.getItem("darkMode");
                  let isDark;

                  if (savedMode !== null) {
                    isDark = savedMode === "true";
                  } else {
                    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                    isDark = prefersDark;
                  }

                  const root = document.documentElement;
                  const appearance = isDark ? "dark" : "light";

                  // Set data attribute for Radix UI
                  root.setAttribute("data-color-mode", appearance);

                  if (isDark) {
                    root.style.setProperty("--color-bg-primary", "#1a2540");
                    root.style.setProperty("--color-bg-secondary", "#253354");
                    root.style.setProperty("--color-text-primary", "#e8eef5");
                    root.style.setProperty("--color-text-secondary", "#a8b3c1");
                    root.style.setProperty("--color-border", "#2a3a4d");
                    root.style.setProperty("--color-message-user-bg", "#253354");
                    root.style.setProperty("--color-message-assistant-bg", "#1e3a5f");
                    root.style.setProperty("--color-scrollbar-track", "#253354");
                    root.style.setProperty("--color-scrollbar-thumb", "#3a4a5f");
                    root.style.setProperty("--color-scrollbar-thumb-hover", "#4a5a6f");
                    root.style.setProperty("--color-code-text", "#e8eef5");
                    root.style.setProperty("--color-code-block-bg", "#2a3a4d");
                    root.style.setProperty("--color-blockquote-border", "#3a4a5f");
                    root.style.setProperty("--color-blockquote-text", "#a8b3c1");
                  } else {
                    root.style.setProperty("--color-bg-primary", "#ffffff");
                    root.style.setProperty("--color-bg-secondary", "#f5f5f5");
                    root.style.setProperty("--color-text-primary", "#171717");
                    root.style.setProperty("--color-text-secondary", "#6b7280");
                    root.style.setProperty("--color-border", "#e5e7eb");
                    root.style.setProperty("--color-message-user-bg", "#f0f0f0");
                    root.style.setProperty("--color-message-assistant-bg", "#e3f2fd");
                    root.style.setProperty("--color-scrollbar-track", "#f1f5f9");
                    root.style.setProperty("--color-scrollbar-thumb", "#cbd5e1");
                    root.style.setProperty("--color-scrollbar-thumb-hover", "#a0aec0");
                    root.style.setProperty("--color-code-text", "#333333");
                    root.style.setProperty("--color-code-block-bg", "#f4f4f4");
                    root.style.setProperty("--color-blockquote-border", "#ddd");
                    root.style.setProperty("--color-blockquote-text", "#666666");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Script
          defer
          data-domain="ft-media-coding-challenge.indexlabs.dev"
          src="https://plausible.indexlabs.dev/js/script.js"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexProvider client={convex}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
