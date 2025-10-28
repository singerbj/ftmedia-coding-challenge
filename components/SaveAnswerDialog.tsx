"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Flex,
  Button,
  TextField,
  Text,
  Badge,
  Spinner,
} from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Cross2Icon } from "@radix-ui/react-icons";

interface SaveAnswerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  onSave: (tags: string[]) => void;
  messages?: { role: "user" | "assistant"; content: string; id: string }[];
  selectedAnswerIndex?: number;
}

export default function SaveAnswerDialog({
  isOpen,
  onClose,
  question,
  onSave,
  messages = [],
  selectedAnswerIndex = -1,
}: SaveAnswerDialogProps) {
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [chatTitle, setChatTitle] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  const saveChat = useMutation(api.messages.saveChat);

  // Generate title when dialog opens and we have messages
  useEffect(() => {
    if (isOpen && messages.length > 0 && chatTitle === null) {
      setIsGeneratingTitle(true);
      const generateTitleAsync = async () => {
        try {
          const response = await fetch("/api/generate-title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages }),
          });

          if (!response.ok) {
            throw new Error("Failed to generate title");
          }

          const data = (await response.json()) as { title: string };
          setChatTitle(data.title);
        } catch (error) {
          console.error("Error generating title:", error);
          // Fallback title
          setChatTitle(`Chat - ${new Date().toLocaleDateString()}`);
        } finally {
          setIsGeneratingTitle(false);
        }
      };
      generateTitleAsync();
    }
  }, [isOpen, messages, chatTitle]);

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (messages && messages.length > 0) {
        // Save the entire chat
        const title = chatTitle || `Chat - ${question.substring(0, 50)}...`;
        // Messages from ai/react already have the correct format
        const cleanMessages = messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
        }));
        await saveChat({
          title,
          messages: cleanMessages,
          highlightedQAIndex: selectedAnswerIndex,
          tags,
        });
        onSave(tags);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Dialog.Content className="max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dialog.Title>Save to Knowledge Base</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Save the entire chat session with the selected Q&A highlighted to your
              team knowledge base.
            </Dialog.Description>
          </motion.div>

          {/* Auto-generated Chat Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Box mb="4">
              <Text as="div" size="2" weight="bold" mb="2">
                Chat Title
              </Text>
              <Box className="bg-color-secondary p-3 rounded text-sm leading-relaxed">
                <AnimatePresence mode="wait">
                  {isGeneratingTitle ? (
                    <motion.div
                      key="generating"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Flex align="center" gap="2">
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
                          Generating title...
                        </Text>
                      </Flex>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="title"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Text size="2">{chatTitle}</Text>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Box mb="4">
              <Text as="div" size="2" weight="bold" mb="2">
                Tags
              </Text>
              <Flex gap="2" mb="2">
                <TextField.Root
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => handleAddTag(tagInput)}
                    variant="outline"
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </motion.div>
              </Flex>

              <AnimatePresence>
                {tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Flex gap="2" wrap="wrap">
                      <AnimatePresence mode="popLayout">
                        {tags.map((tag) => (
                          <motion.div
                            key={tag}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge variant="soft">
                              {tag}
                              <motion.button
                                onClick={() => handleRemoveTag(tag)}
                                className="bg-none border-0 cursor-pointer ml-1 p-0 flex items-center"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Cross2Icon width={12} height={12} />
                              </motion.button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </Flex>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </motion.div>
              </Dialog.Close>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={isSaving || isGeneratingTitle || !chatTitle}
                  title={!chatTitle ? "Waiting for title to generate..." : ""}
                >
                  {isSaving ? "Saving..." : "Save Chat Session"}
                </Button>
              </motion.div>
            </Flex>
          </motion.div>
        </Dialog.Content>
      </motion.div>
    </Dialog.Root>
  );
}
