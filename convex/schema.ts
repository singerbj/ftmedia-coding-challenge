import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    question: v.string(),
    answer: v.string(),
    tags: v.array(v.string()),
    isPinned: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    isFlagged: v.boolean(),
    flagReason: v.optional(v.string()),
  })
    .index("by_pinned", ["isPinned"])
    .index("by_flagged", ["isFlagged"])
    .index("by_created", ["createdAt"]),

  chats: defineTable({
    title: v.string(),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    highlightedQAIndex: v.number(), // Index of the Q&A pair that was saved
    tags: v.array(v.string()),
    isPinned: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    isFlagged: v.boolean(),
    flagReason: v.optional(v.string()),
  })
    .index("by_pinned", ["isPinned"])
    .index("by_flagged", ["isFlagged"])
    .index("by_created", ["createdAt"]),

  tags: defineTable({
    name: v.string(),
    count: v.number(),
    color: v.optional(v.string()),
  }).index("by_name", ["name"]),
});
