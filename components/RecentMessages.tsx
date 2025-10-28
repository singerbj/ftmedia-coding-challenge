"use client";

import { useState, useMemo, useEffect, SetStateAction, Dispatch } from "react";
import {
  Box,
  Flex,
  Text,
  Card,
  Button,
  Dialog,
  Badge,
  Select,
} from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  TrashIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
  SewingPinIcon,
  MagnifyingGlassIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import TagManager from "./TagManager";
import {
  containerVariants,
  itemVariants,
  skeletonContainerFadeOut,
} from "@/lib/animations";
import { ChatCardSkeletonLoader } from "./SkeletonLoader";

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

interface RecentMessagesProps {
  onRefresh: () => void;
  onChatSelect?: Dispatch<SetStateAction<Chat | null>>;
  searchInput?: string;
}

type SortOption = "recent" | "oldest" | "alphabetical" | "messagecount";
type FilterOption = "all" | "pinned" | "unpinned" | "flagged";

export default function RecentMessages({
  onRefresh,
  onChatSelect,
  searchInput = "",
}: RecentMessagesProps) {
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(
    null
  );
  const [flagReason, setFlagReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  const chats = useQuery(api.messages.getChats, {});
  const allTags = useQuery(api.messages.getAllTags, {});

  // Update search query when searchInput prop changes
  useEffect(() => {
    if (searchInput) {
      setSearchQuery(searchInput);
    }
  }, [searchInput]);

  const toggleChatPin = useMutation(api.messages.toggleChatPin);
  const flagChat = useMutation(api.messages.flagChat);
  const deleteChat = useMutation(api.messages.deleteChat);
  const addTagToChat = useMutation(api.messages.addTagToChat);
  const removeTagFromChat = useMutation(api.messages.removeTagFromChat);

  const handleFlagSubmit = async () => {
    if (selectedChatId && flagReason.trim()) {
      try {
        await flagChat({
          chatId: selectedChatId,
          reason: flagReason,
        });
        setFlagDialogOpen(false);
        setFlagReason("");
        setSelectedChatId(null);
        onRefresh();
      } catch (error) {
        console.error("Failed to flag chat:", error);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedChatId) {
      setIsDeleting(true);
      try {
        await deleteChat({ chatId: selectedChatId });
        setDeleteDialogOpen(false);
        setSelectedChatId(null);
        onRefresh();
      } catch (error) {
        console.error("Failed to delete chat:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleChatPin = async (chatId: Id<"chats">) => {
    try {
      await toggleChatPin({ chatId });
      onRefresh();
    } catch (error) {
      console.error("Failed to toggle chat pin:", error);
    }
  };

  const handleChatFlag = async (chatId: Id<"chats">) => {
    setSelectedChatId(chatId);
    setFlagDialogOpen(true);
  };

  const handleChatDeleteClick = (chatId: Id<"chats">) => {
    setSelectedChatId(chatId);
    setDeleteDialogOpen(true);
  };

  // Filter messages based on search query
  const filteredMessages =
    chats?.filter((chat) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        chat.title.toLowerCase().includes(searchLower) ||
        chat.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }) || [];

  // Filter and sort chats based on search query, filter, and sort options
  const filteredChats = useMemo(() => {
    let result = (chats || []).filter((chat) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        chat.title.toLowerCase().includes(searchLower) ||
        chat.messages.some((m) =>
          m.content.toLowerCase().includes(searchLower)
        ) ||
        chat.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    });

    // Apply filter option
    if (filterBy === "pinned") {
      result = result.filter((chat) => chat.isPinned);
    } else if (filterBy === "unpinned") {
      result = result.filter((chat) => !chat.isPinned);
    } else if (filterBy === "flagged") {
      result = result.filter((chat) => chat.isFlagged);
    }

    // Apply sort option
    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.createdAt - b.createdAt;
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "messagecount":
          return b.messages.length - a.messages.length;
        case "recent":
        default:
          // Pinned items first, then by creation date (newest first)
          if (a.isPinned !== b.isPinned) {
            return a.isPinned ? -1 : 1;
          }
          return b.createdAt - a.createdAt;
      }
    });

    return result;
  }, [chats, searchQuery, filterBy, sortBy]);

  const totalCount = filteredMessages.length + filteredChats.length;

  return (
    <Flex direction="column" className="h-full w-full overflow-hidden">
      {/* Header */}
      <Box className="bg-color-primary rounded-none p-4 shadow-sm shrink-0">
        <Flex direction="column" gap="3">
          <Text as="div" size="4" weight="bold">
            Knowledge Base ({totalCount})
          </Text>

          {/* Search Input */}
          <Box className="relative">
            <input
              type="text"
              placeholder="Search Q&A and chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-8 py-2 rounded border border-color-primary text-sm box-border"
              style={{ paddingRight: searchQuery ? "32px" : "12px" }}
            />
            <Box className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <MagnifyingGlassIcon width={16} height={16} />
            </Box>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-none border-0 p-1 cursor-pointer flex items-center justify-center text-gray-500 hover:text-gray-700"
                aria-label="Clear search"
              >
                <Cross2Icon width={16} height={16} />
              </button>
            )}
          </Box>

          {/* Filter and Sort Controls */}
          <Flex gap="2" wrap="wrap">
            <Select.Root
              value={filterBy}
              onValueChange={(value) => setFilterBy(value as FilterOption)}
            >
              <Select.Trigger placeholder="Filter..." />
              <Select.Content>
                <Select.Item value="all">All Chats</Select.Item>
                <Select.Item value="pinned">Pinned Only</Select.Item>
                <Select.Item value="unpinned">Unpinned Only</Select.Item>
                <Select.Item value="flagged">Flagged Only</Select.Item>
              </Select.Content>
            </Select.Root>

            <Select.Root
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <Select.Trigger placeholder="Sort..." />
              <Select.Content>
                <Select.Item value="recent">
                  Most Recent (Pinned First)
                </Select.Item>
                <Select.Item value="oldest">Oldest First</Select.Item>
                <Select.Item value="alphabetical">
                  Alphabetical (A-Z)
                </Select.Item>
                <Select.Item value="messagecount">Most Messages</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
      </Box>

      {/* Content */}
      <Box className="flex-1 overflow-y-auto bg-color-primary rounded-none shadow-none p-4">
        <AnimatePresence mode="wait">
          {!chats ? (
            <motion.div
              key="skeleton"
              variants={skeletonContainerFadeOut}
              initial={{ opacity: 1 }}
              exit="exit"
            >
              <ChatCardSkeletonLoader count={3} />
            </motion.div>
          ) : (chats || []).length === 0 ? (
            <motion.div
              key="empty-initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Text as="div" className="text-color-secondary" align="center">
                <div className="p-8">
                  No saved chats yet. Save entire chat sessions with highlighted
                  Q&As to build your knowledge base.
                </div>
              </Text>
            </motion.div>
          ) : filteredChats.length === 0 ? (
            <motion.div
              key="empty-filtered"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Text as="div" className="text-color-secondary" align="center">
                <div className="p-8">No results found</div>
              </Text>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Flex direction="column" gap="3">
                <AnimatePresence mode="popLayout">
                  {filteredChats.map((chat) => (
                    <motion.div
                      key={chat._id}
                      layout
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="p-3">
                          <Flex direction="column" gap="2">
                            {/* Header */}
                            <Flex justify="between" align="start" pb="1">
                              <Flex
                                direction="column"
                                gap="1"
                                className="flex-1"
                              >
                                <Text size="2" weight="bold">
                                  {chat.title}
                                </Text>
                                <Text size="1" className="text-color-secondary">
                                  {new Date(
                                    chat.createdAt
                                  ).toLocaleDateString()}
                                </Text>
                              </Flex>
                              <AnimatePresence>
                                {chat.isPinned && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                  >
                                    <Button
                                      size="1"
                                      variant="ghost"
                                      onClick={() => handleChatPin(chat._id)}
                                    >
                                      <SewingPinIcon />
                                    </Button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Flex>

                            {/* Tags */}
                            <AnimatePresence>
                              {chat.tags.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                >
                                  <Flex gap="1" wrap="wrap">
                                    <AnimatePresence mode="popLayout">
                                      {chat.tags.map((tag) => (
                                        <motion.div
                                          key={tag}
                                          layout
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                          <Badge color="blue" size="1">
                                            {tag}
                                          </Badge>
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>
                                  </Flex>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Actions */}
                            <Flex className="w-full">
                              <Flex
                                gap="4"
                                mt="2"
                                ml="2"
                                wrap="wrap"
                                className="flex-1"
                              >
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    size="1"
                                    variant="ghost"
                                    onClick={() => {
                                      // Load chat into AI assistant when viewing
                                      if (onChatSelect) {
                                        onChatSelect(chat);
                                      }
                                    }}
                                  >
                                    <EyeOpenIcon />
                                    View
                                  </Button>
                                </motion.div>
                                <TagManager
                                  chatId={chat._id}
                                  tags={chat.tags}
                                  availableTags={
                                    allTags?.map(
                                      (t: { name: string }) => t.name
                                    ) || []
                                  }
                                  onAddTag={async (tag) => {
                                    await addTagToChat({
                                      chatId: chat._id,
                                      tag,
                                    });
                                    onRefresh();
                                  }}
                                  onRemoveTag={async (tag) => {
                                    await removeTagFromChat({
                                      chatId: chat._id,
                                      tag,
                                    });
                                    onRefresh();
                                  }}
                                />
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    size="1"
                                    variant="ghost"
                                    onClick={() => handleChatPin(chat._id)}
                                  >
                                    <SewingPinIcon />
                                    {chat.isPinned ? "Unpin" : "Pin"}
                                  </Button>
                                </motion.div>
                              </Flex>
                              <Flex gap="4" mt="2" mr="2" wrap="wrap">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    size="1"
                                    variant="ghost"
                                    color="yellow"
                                    onClick={() => handleChatFlag(chat._id)}
                                  >
                                    <ExclamationTriangleIcon />
                                    Flag
                                  </Button>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    size="1"
                                    variant="ghost"
                                    color="red"
                                    onClick={() =>
                                      handleChatDeleteClick(chat._id)
                                    }
                                  >
                                    <TrashIcon />
                                    Delete
                                  </Button>
                                </motion.div>
                              </Flex>
                            </Flex>
                          </Flex>
                        </Card>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Content className="max-w-sm">
          <Dialog.Title>Delete {selectedChatId ? "Chat" : "Q&A"}</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete this{" "}
            {selectedChatId ? "chat" : "Q&A"}? This action cannot be undone.
          </Dialog.Description>

          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              color="red"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Flag Dialog */}
      <Dialog.Root open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <Dialog.Content className="max-w-sm">
          <Dialog.Title>Report Content</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Please explain why you&apos;re flagging this content for moderation.
          </Dialog.Description>

          <Box mb="4">
            <textarea
              placeholder="Describe the issue..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="w-full min-h-20 p-2 rounded border border-gray-300 text-sm"
            />
          </Box>

          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleFlagSubmit}
              disabled={!flagReason.trim()}
              color="red"
            >
              Report
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
}
