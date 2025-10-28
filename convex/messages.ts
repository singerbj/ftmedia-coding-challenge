import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllTags = query({
  handler: async (ctx) => {
    const tags = await ctx.db.query("tags").collect();
    return tags.sort((a, b) => b.count - a.count);
  },
});

export const togglePin = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    await ctx.db.patch(args.messageId, {
      isPinned: !message.isPinned,
      updatedAt: Date.now(),
    });

    return message;
  },
});

// Chat-related mutations and queries
export const saveChat = mutation({
  args: {
    title: v.string(),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    highlightedQAIndex: v.number(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("chats", {
      title: args.title,
      messages: args.messages,
      highlightedQAIndex: args.highlightedQAIndex,
      tags: args.tags,
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isFlagged: false,
      flagReason: undefined,
    });

    // Update tag counts
    for (const tag of args.tags) {
      const existingTag = await ctx.db
        .query("tags")
        .filter((t) => t.eq(t.field("name"), tag))
        .first();

      if (existingTag) {
        await ctx.db.patch(existingTag._id, {
          count: existingTag.count + 1,
        });
      } else {
        await ctx.db.insert("tags", {
          name: tag,
          count: 1,
        });
      }
    }

    return id;
  },
});

export const getChats = query({
  args: {
    tag: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("chats")
      .filter((c) => c.eq(c.field("isFlagged"), false));

    let results = await query.collect();

    // Filter by tag if provided
    if (args.tag) {
      const tag = args.tag;
      results = results.filter((c) => c.tags.includes(tag));
    }

    // Filter by search term if provided
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.messages.some((m) => m.content.toLowerCase().includes(term))
      );
    }

    // Sort: pinned first, then by creation date
    results.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return b.createdAt - a.createdAt;
    });

    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

export const toggleChatPin = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    await ctx.db.patch(args.chatId, {
      isPinned: !chat.isPinned,
      updatedAt: Date.now(),
    });

    return chat;
  },
});

export const flagChat = mutation({
  args: {
    chatId: v.id("chats"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    await ctx.db.patch(args.chatId, {
      isFlagged: true,
      flagReason: args.reason,
      updatedAt: Date.now(),
    });

    return chat;
  },
});

export const deleteChat = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    // Update tag counts
    for (const tag of chat.tags) {
      const tagDoc = await ctx.db
        .query("tags")
        .filter((t) => t.eq(t.field("name"), tag))
        .first();

      if (tagDoc) {
        if (tagDoc.count <= 1) {
          await ctx.db.delete(tagDoc._id);
        } else {
          await ctx.db.patch(tagDoc._id, {
            count: tagDoc.count - 1,
          });
        }
      }
    }

    await ctx.db.delete(args.chatId);
    return chat;
  },
});

export const addTagToChat = mutation({
  args: {
    chatId: v.id("chats"),
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    // Don't add duplicate tags
    if (chat.tags.includes(args.tag)) {
      return chat;
    }

    // Add tag to chat
    const updatedTags = [...chat.tags, args.tag];
    await ctx.db.patch(args.chatId, {
      tags: updatedTags,
      updatedAt: Date.now(),
    });

    // Update tag count
    const existingTag = await ctx.db
      .query("tags")
      .filter((t) => t.eq(t.field("name"), args.tag))
      .first();

    if (existingTag) {
      await ctx.db.patch(existingTag._id, {
        count: existingTag.count + 1,
      });
    } else {
      await ctx.db.insert("tags", {
        name: args.tag,
        count: 1,
      });
    }

    return await ctx.db.get(args.chatId);
  },
});

export const removeTagFromChat = mutation({
  args: {
    chatId: v.id("chats"),
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    // Remove tag from chat
    const updatedTags = chat.tags.filter((t) => t !== args.tag);
    await ctx.db.patch(args.chatId, {
      tags: updatedTags,
      updatedAt: Date.now(),
    });

    // Update tag count
    const tagDoc = await ctx.db
      .query("tags")
      .filter((t) => t.eq(t.field("name"), args.tag))
      .first();

    if (tagDoc) {
      if (tagDoc.count <= 1) {
        await ctx.db.delete(tagDoc._id);
      } else {
        await ctx.db.patch(tagDoc._id, {
          count: tagDoc.count - 1,
        });
      }
    }

    return await ctx.db.get(args.chatId);
  },
});
