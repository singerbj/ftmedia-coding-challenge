"use client";

import { useState } from "react";
import { Box } from "@radix-ui/themes";
import Header from "@/components/Header";
import ChatInterface from "@/components/ChatInterface";
import KnowledgeBaseSidebar from "@/components/KnowledgeBaseSidebar";
import RecentMessages from "@/components/RecentMessages";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Chat {
  _id: string;
  title: string;
  messages: ChatMessage[];
  highlightedQAIndex: number;
  tags: string[];
  isPinned: boolean;
  createdAt: number;
  isFlagged: boolean;
}

export default function Dashboard() {
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedChatForView, setSelectedChatForView] = useState<Chat | null>(
    null
  );
  const [searchInput, setSearchInput] = useState("");

  const handleTagSearchClick = (tagName: string) => {
    setSearchInput(tagName);
  };

  // Convert chat messages to ChatInterface format
  const chatMessagesForView = selectedChatForView
    ? selectedChatForView.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        isStreaming: false,
      }))
    : undefined;

  return (
    <div className="flex flex-col h-screen bg-color-primary overflow-hidden">
      {/* Header */}
      <Header onMobileMenuToggle={setIsMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:flex w-80 border-r border-color-primary bg-color-primary overflow-y-auto flex-col">
          <Box p="4">
            <KnowledgeBaseSidebar
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
              onPinnedItemClick={setSelectedChatForView}
              onTagSearchClick={handleTagSearchClick}
            />
          </Box>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1 gap-0 overflow-hidden">
          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Mobile Sidebar Drawer */}
          {isMobileMenuOpen && (
            <div className="fixed top-14 left-0 bottom-0 w-4/5 bg-color-primary border-r border-color-primary overflow-y-auto z-40">
              <Box p="4">
                <KnowledgeBaseSidebar
                  selectedTag={selectedTag}
                  onTagSelect={setSelectedTag}
                  onPinnedItemClick={setSelectedChatForView}
                  onTagSearchClick={handleTagSearchClick}
                />
              </Box>
            </div>
          )}

          {/* Recent Messages / Knowledge Base */}
          <div className="flex flex-col border-r border-b border-color-primary lg:border-b-0 overflow-hidden">
            <RecentMessages
              onRefresh={() => {}}
              onChatSelect={setSelectedChatForView}
              searchInput={searchInput}
            />
          </div>

          {/* Chat Interface */}
          <div className="flex flex-col border-r border-color-primary lg:border-r-0 overflow-hidden">
            <ChatInterface
              initialMessages={chatMessagesForView}
              highlightedQAIndex={selectedChatForView?.highlightedQAIndex}
              onChatCleared={() => setSelectedChatForView(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
