"use client";

import { useState } from "react";
import {
  Dialog,
  Box,
  Flex,
  Text,
  Button,
  Badge,
  TextField,
} from "@radix-ui/themes";
import { Cross2Icon, PlusIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Id } from "@/convex/_generated/dataModel";

interface TagManagerProps {
  chatId: Id<"chats">;
  tags: string[];
  availableTags: string[];
  onAddTag: (tag: string) => Promise<void>;
  onRemoveTag: (tag: string) => Promise<void>;
  isLoading?: boolean;
}

export default function TagManager({
  // chatId is part of the interface for consistency but not used in this component
  tags,
  availableTags,
  onAddTag,
  onRemoveTag,
  isLoading = false,
}: TagManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [removingTag, setRemovingTag] = useState<string | null>(null);

  const unusedTags = availableTags.filter((tag) => !tags.includes(tag));

  const handleAddTag = async () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setAddingTag(true);
      try {
        await onAddTag(newTag.trim());
        setNewTag("");
      } catch (error) {
        console.error("Failed to add tag:", error);
      } finally {
        setAddingTag(false);
      }
    }
  };

  const handleRemoveTag = async (tag: string) => {
    setRemovingTag(tag);
    try {
      await onRemoveTag(tag);
    } catch (error) {
      console.error("Failed to remove tag:", error);
    } finally {
      setRemovingTag(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      handleAddTag();
    }
  };

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Button
        size="1"
        variant="ghost"
        onClick={() => setDialogOpen(true)}
        disabled={isLoading}
      >
        <Pencil1Icon />
        Edit Tags
      </Button>

      <Dialog.Content className="max-w-lg">
        <Dialog.Title>Manage Tags</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Add or remove tags from this chat to better organize your knowledge
          base.
        </Dialog.Description>

        <Box mb="4">
          {/* Current Tags */}
          <Text size="2" weight="bold" mb="2" as="div">
            Current Tags ({tags.length})
          </Text>
          {tags.length === 0 ? (
            <Text size="1" className="text-color-secondary" as="div">
              No tags assigned yet
            </Text>
          ) : (
            <Flex gap="2" wrap="wrap" mb="3">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="soft"
                  className="flex items-center gap-1.5"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    disabled={removingTag === tag}
                    className="bg-none border-0 cursor-pointer p-0 flex items-center opacity-100 hover:opacity-60 disabled:opacity-60 transition-opacity"
                  >
                    <Cross2Icon width={14} height={14} />
                  </button>
                </Badge>
              ))}
            </Flex>
          )}
        </Box>

        {/* Add New Tag */}
        <Box mb="4">
          <Text size="2" weight="bold" mb="2" as="div">
            Add New Tag
          </Text>
          <Flex gap="2">
            <TextField.Root
              placeholder="Enter tag name..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={addingTag}
              className="flex-1"
            />
            <Button
              onClick={handleAddTag}
              disabled={
                addingTag || !newTag.trim() || tags.includes(newTag.trim())
              }
              size="2"
            >
              <PlusIcon />
              Add
            </Button>
          </Flex>
        </Box>

        {/* Quick Add from Available Tags */}
        {unusedTags.length > 0 && (
          <Box mb="4">
            <Text size="2" weight="bold" mb="2" as="div">
              Available Tags ({unusedTags.length})
            </Text>
            <Flex gap="2" wrap="wrap">
              {unusedTags.map((tag) => (
                <Button
                  key={tag}
                  size="1"
                  variant="outline"
                  onClick={async () => {
                    setAddingTag(true);
                    try {
                      await onAddTag(tag);
                    } catch (error) {
                      console.error("Failed to add tag:", error);
                    } finally {
                      setAddingTag(false);
                    }
                  }}
                  disabled={addingTag}
                  className="cursor-pointer"
                >
                  <PlusIcon width={14} height={14} />
                  {tag}
                </Button>
              ))}
            </Flex>
          </Box>
        )}

        {/* Footer */}
        <Flex gap="3" justify="end" mt="6">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Done
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
