"use client";

import React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatViewProps {
  messages: Message[];
  highlightedQAIndex: number;
  title: string;
}

export default function ChatView({
  messages,
  highlightedQAIndex,
  title,
}: ChatViewProps) {
  return (
    <Flex direction="column" gap="3" className="w-full">
      {/* Title */}
      <Text as="div" size="4" weight="bold">
        {title}
      </Text>

      {/* Messages with Highlight */}
      <Flex direction="column" gap="3">
        {messages.map((msg, idx) => {
          // Check if this message is part of the highlighted Q&A
          const isPartOfHighlight =
            (idx === highlightedQAIndex - 1 && msg.role === "user") || // Question
            (idx === highlightedQAIndex && msg.role === "assistant"); // Answer

          return (
            <Flex
              key={idx}
              justify={msg.role === "user" ? "start" : "end"}
              className="mb-2 w-full"
            >
              <Flex
                direction="column"
                gap="2"
                className={`p-3 rounded-lg max-w-4/5 relative ${
                  isPartOfHighlight
                    ? "bg-yellow-100 border-2 border-yellow-500"
                    : msg.role === "user"
                      ? "message-user-bg"
                      : "message-assistant-bg"
                }`}
              >
                {/* Highlight Badge */}
                {isPartOfHighlight && (
                  <Box className="absolute -top-3 right-3 bg-yellow-400 text-black px-2 py-0.5 rounded text-xs font-bold">
                    {msg.role === "user" ? "Question" : "Answer"}
                  </Box>
                )}

                <Text size="1" weight="bold" className="text-color-secondary">
                  {msg.role === "user" ? "You" : "Assistant"}
                </Text>
                <Text size="2">{msg.content}</Text>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
