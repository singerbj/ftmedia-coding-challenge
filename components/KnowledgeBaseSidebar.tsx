"use client";

import { useMemo } from "react";
import { Box, Flex, Text, Badge, Button } from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SewingPinIcon } from "@radix-ui/react-icons";
import {
  containerVariants,
  itemVariants,
  skeletonContainerFadeOut,
} from "@/lib/animations";
import { TagSkeletonLoader, PinnedItemSkeletonLoader } from "./SkeletonLoader";

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

interface KnowledgeBaseSidebarProps {
  selectedTag?: string;
  onTagSelect: (tag: string | undefined) => void;
  onPinnedItemClick?: (chat: Chat) => void;
  onTagSearchClick?: (tagName: string) => void;
}

export default function KnowledgeBaseSidebar({
  selectedTag,
  onTagSelect,
  onPinnedItemClick,
  onTagSearchClick = () => {},
}: KnowledgeBaseSidebarProps) {
  const tags = useQuery(api.messages.getAllTags);
  const chats = useQuery(api.messages.getChats, { limit: 10 });
  const togglePin = useMutation(api.messages.toggleChatPin);

  // Get pinned messages
  const pinned = useMemo(() => chats?.filter((m) => m.isPinned) || [], [chats]);

  return (
    <Flex direction="column" gap="4" className="h-full w-full">
      {/* Tags */}
      <Box>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Text as="div" size="2" weight="bold" mb="2">
            Top Tags
          </Text>
        </motion.div>
        <AnimatePresence mode="wait">
          {!tags ? (
            <motion.div
              key="skeleton"
              variants={skeletonContainerFadeOut}
              initial={{ opacity: 1 }}
              exit="exit"
            >
              <TagSkeletonLoader />
            </motion.div>
          ) : tags.length > 0 ? (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Flex direction="column" gap="2">
                <AnimatePresence mode="popLayout">
                  {tags.slice(0, 10).map((tag) => (
                    <motion.div
                      key={tag._id}
                      layout
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Flex
                        justify="between"
                        align="center"
                        className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                          selectedTag === tag.name ? "message-assistant-bg" : ""
                        }`}
                        onClick={() => {
                          onTagSelect(
                            selectedTag === tag.name ? undefined : tag.name
                          );
                          if (selectedTag !== tag.name && onTagSearchClick) {
                            onTagSearchClick(tag.name);
                          }
                        }}
                      >
                        <Text
                          size="2"
                          className="overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          {tag.name}
                        </Text>
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge size="1" color="blue">
                            {tag.count}
                          </Badge>
                        </motion.div>
                      </Flex>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Flex>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Text size="2" className="text-color-secondary">
                No tags yet
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Pinned Items */}
      <Box>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Text as="div" size="2" weight="bold" mb="2">
            Pinned Knowledge
          </Text>
        </motion.div>
        <AnimatePresence mode="wait">
          {!chats ? (
            <motion.div
              key="skeleton"
              variants={skeletonContainerFadeOut}
              initial={{ opacity: 1 }}
              exit="exit"
            >
              <PinnedItemSkeletonLoader count={2} />
            </motion.div>
          ) : pinned.length > 0 ? (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Flex direction="column" gap="2">
                <AnimatePresence mode="popLayout">
                  {pinned.map((msg) => (
                    <motion.div
                      key={msg._id}
                      layout
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Flex
                        justify="between"
                        align="center"
                        className="px-2 py-1 rounded cursor-pointer hover:bg-color-secondary transition-colors gap-4"
                        onClick={() => onPinnedItemClick?.(msg)}
                      >
                        <Text
                          size="2"
                          className="overflow-hidden text-ellipsis whitespace-nowrap flex-1"
                        >
                          {msg.title}
                        </Text>

                        <Button
                          size="1"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin({ chatId: msg._id });
                          }}
                        >
                          <SewingPinIcon />
                        </Button>
                      </Flex>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Flex>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Text size="2" className="text-color-secondary">
                No pinned answers yet
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Flex>
  );
}
