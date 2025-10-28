"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import { Flex, TextArea, Button, Text, Spinner } from "@radix-ui/themes";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import SaveAnswerDialog from "./SaveAnswerDialog";
import StreamdownRenderer from "./StreamdownRenderer";
import { ResetIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import {
  fadeInUp,
  fadeInDown,
  messageItem,
  messageStaggerContainer,
} from "@/lib/animations";

interface ChatInterfaceProps {
  onMessageSaved?: () => void;
  initialMessages?: { role: "user" | "assistant"; content: string }[];
  highlightedQAIndex?: number;
  onChatCleared?: () => void;
}

export default function ChatInterface({
  onMessageSaved,
  initialMessages,
  highlightedQAIndex,
  onChatCleared,
}: ChatInterfaceProps) {
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = React.useState<
    number | null
  >(null);
  const [input, setInput] = useState("");

  // Create initial messages with proper format (parts-based)
  const parsedInitialMessages = useMemo(
    () =>
      initialMessages?.map((msg, idx) => ({
        id: `initial-${idx}`,
        role: msg.role as "user" | "assistant",
        parts: [{ type: "text" as const, text: msg.content }],
      })) || [],
    [initialMessages]
  );

  const { messages, sendMessage, setMessages, status } = useChat({
    messages: parsedInitialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  // Update messages when initialMessages changes (e.g., when a knowledge base item is selected)
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(parsedInitialMessages);
    }
  }, [initialMessages, parsedInitialMessages, setMessages]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage({
      role: "user",
      parts: [{ type: "text", text: input }],
    });
    setInput("");
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const highlightedMessageRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Helper to extract text content from message parts
  const getMessageContent = (msg: (typeof messages)[0]): string => {
    if (!msg.parts) return "";
    return msg.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text"
      )
      .map((part) => part.text)
      .join("");
  };

  // Scroll to bottom of messages, unless we have a highlighted message to scroll to
  useEffect(() => {
    if (highlightedQAIndex === undefined) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, highlightedQAIndex]);

  // Scroll to highlighted message when it's loaded
  useEffect(() => {
    if (
      highlightedQAIndex !== undefined &&
      highlightedMessageRef.current &&
      messagesContainerRef.current
    ) {
      setTimeout(() => {
        if (highlightedMessageRef.current && messagesContainerRef.current) {
          highlightedMessageRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [highlightedQAIndex, messages.length]);

  const handleSaveClick = (index: number) => {
    setSelectedAnswerIndex(index);
    setShowSaveDialog(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <motion.div
        className="bg-color-primary rounded-none p-4 shadow-sm shrink-0 grow-0 flex justify-between items-start"
        initial="initial"
        animate="animate"
        variants={fadeInDown}
      >
        <div>
          <Text as="div" size="5" weight="bold">
            AI Assistant
          </Text>
          <Text as="div" size="2" className="text-color-secondary">
            Ask questions and get answers from the team AI Assistant
          </Text>
        </div>
        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={() => {
                  setMessages([]);
                  setInput("");
                  onChatCleared?.();
                }}
                variant="outline"
                size="2"
                className="shrink-0"
              >
                <ResetIcon />
                Reset Chat
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-color-primary rounded-none p-4 shadow-none flex flex-col"
        style={{ minHeight: 0 }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={messageStaggerContainer}
        >
          <Flex direction="column" gap="3" className="min-h-min">
            {messages.length === 0 ? (
              <motion.div variants={messageItem}>
                <Text as="div" className="text-color-secondary" align="center">
                  <div className="p-8">
                    No messages yet. Ask a question to get started!
                  </div>
                </Text>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => {
                  const isHighlighted =
                    highlightedQAIndex !== undefined &&
                    (idx === highlightedQAIndex ||
                      idx === highlightedQAIndex - 1);

                  return (
                    <Flex
                      key={msg.id}
                      ref={isHighlighted ? highlightedMessageRef : null}
                      justify={msg.role === "user" ? "start" : "end"}
                      className="mb-3 w-full"
                    >
                      <Flex
                        direction="column"
                        gap="2"
                        className={`p-3 rounded-lg max-w-4/5 ${
                          msg.role === "user"
                            ? "message-user-bg"
                            : "message-assistant-bg"
                        } ${isHighlighted ? "border-2 border-blue-500" : ""}`}
                      >
                        <Text
                          size="1"
                          weight="bold"
                          className="text-color-secondary"
                        >
                          {msg.role === "user" ? "You" : "Assistant"}
                        </Text>
                        {msg.role === "assistant" ? (
                          <StreamdownRenderer
                            content={getMessageContent(msg)}
                          />
                        ) : (
                          <Text size="2">{getMessageContent(msg)}</Text>
                        )}
                        {msg.role === "assistant" && (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              size="1"
                              variant="outline"
                              onClick={() => handleSaveClick(idx)}
                              className="mt-2 w-fit"
                            >
                              Save Answer
                            </Button>
                          </motion.div>
                        )}
                      </Flex>
                    </Flex>
                  );
                })}
              </AnimatePresence>
            )}
            <AnimatePresence>
              {isLoading && (
                <motion.div variants={messageItem}>
                  <Flex gap="2" align="center">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Spinner size="2" />
                    </motion.div>
                    <Text size="2" className="text-color-secondary">
                      Assistant is thinking...
                    </Text>
                  </Flex>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </Flex>
        </motion.div>
      </div>

      {/* Input Area */}
      <motion.div
        className="bg-color-primary rounded-none p-4 shadow-sm shrink-0 grow-0"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <form onSubmit={handleSubmit} className="contents">
          <Flex direction="column" gap="3">
            <TextArea
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-20"
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-full"
              >
                <PaperPlaneIcon /> Send Question
              </Button>
            </motion.div>
          </Flex>
        </form>
      </motion.div>

      {/* Save Answer Dialog */}
      {showSaveDialog && selectedAnswerIndex !== null && (
        <SaveAnswerDialog
          isOpen={showSaveDialog}
          onClose={() => {
            setShowSaveDialog(false);
            setSelectedAnswerIndex(null);
          }}
          question={getMessageContent(messages[selectedAnswerIndex - 1]) || ""}
          messages={messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: getMessageContent(msg),
          }))}
          selectedAnswerIndex={selectedAnswerIndex}
          onSave={() => {
            setShowSaveDialog(false);
            setSelectedAnswerIndex(null);
            onMessageSaved?.();
          }}
        />
      )}
    </div>
  );
}
