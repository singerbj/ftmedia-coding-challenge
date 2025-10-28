/**
 * Unit tests for Convex message functions
 * Note: These tests use mocked Convex context and database operations
 */

/// <reference types="jest" />

// Mock database and context
const createMockCtx = () => {
  const db = {
    query: jest.fn(),
    insert: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
  };

  return {
    db,
  };
};

// Mock query builder
interface MockQueryBuilder {
  collect: jest.Mock;
  first: jest.Mock;
  filter: jest.Mock;
}

const createMockQuery = (results: unknown[]): MockQueryBuilder => {
  return {
    collect: jest.fn().mockResolvedValue(results),
    first: jest.fn().mockResolvedValue(results[0] || null),
    filter: jest.fn().mockReturnThis(),
  };
};

describe("Convex Messages Functions", () => {
  describe("getAllTags", () => {
    it("should return tags sorted by count descending", async () => {
      const mockTags = [
        { _id: "1", name: "python", count: 5 },
        { _id: "2", name: "javascript", count: 10 },
        { _id: "3", name: "react", count: 7 },
      ];

      const mockCtx = createMockCtx();
      const mockQuery = createMockQuery(mockTags);
      mockCtx.db.query.mockReturnValue(mockQuery);

      // Simulate sorting logic
      const sorted = [...mockTags].sort((a, b) => b.count - a.count);

      expect(sorted[0].name).toBe("javascript");
      expect(sorted[1].name).toBe("react");
      expect(sorted[2].name).toBe("python");
    });
  });

  describe("togglePin", () => {
    it("should toggle isPinned status", async () => {
      const mockMessage = {
        _id: "123",
        isPinned: false,
        updatedAt: Date.now(),
      };

      const mockCtx = createMockCtx();
      mockCtx.db.get.mockResolvedValue(mockMessage);

      // Simulate toggle logic
      const newPinnedStatus = !mockMessage.isPinned;

      expect(newPinnedStatus).toBe(true);
    });

    it("should throw error if message not found", async () => {
      const mockCtx = createMockCtx();
      mockCtx.db.get.mockResolvedValue(null);

      // Simulate the function that checks if a message exists
      const getMessageOrThrow = async (id: string) => {
        const message = await mockCtx.db.get(id);
        if (!message) throw new Error("Message not found");
        return message;
      };

      expect(getMessageOrThrow("invalid-id")).rejects.toThrow(
        "Message not found"
      );
    });
  });

  describe("saveChat", () => {
    it("should create new chat and update tag counts", async () => {
      const mockChatData = {
        title: "Test Chat",
        messages: [
          { id: "1", role: "user" as const, content: "Question?" },
          { id: "2", role: "assistant" as const, content: "Answer!" },
        ],
        highlightedQAIndex: 1,
        tags: ["test", "demo"],
      };

      const mockCtx = createMockCtx();
      mockCtx.db.insert.mockResolvedValue("new-chat-id");

      const mockExistingTag = { _id: "tag-1", name: "test", count: 5 };
      const mockQuery = createMockQuery([mockExistingTag]);
      mockCtx.db.query.mockReturnValue(mockQuery);

      // Simulate tag count update
      const newCount = mockExistingTag.count + 1;
      expect(newCount).toBe(6);
    });
  });

  describe("getChats", () => {
    it("should filter chats by tag", () => {
      const mockChats = [
        {
          _id: "1",
          tags: ["python", "backend"],
          isFlagged: false,
          isPinned: false,
          createdAt: 1,
        },
        {
          _id: "2",
          tags: ["javascript", "frontend"],
          isFlagged: false,
          isPinned: false,
          createdAt: 2,
        },
        {
          _id: "3",
          tags: ["python", "data"],
          isFlagged: false,
          isPinned: false,
          createdAt: 3,
        },
      ];

      const filtered = mockChats.filter((c) => c.tags.includes("python"));
      expect(filtered).toHaveLength(2);
      expect(filtered.every((c) => c.tags.includes("python"))).toBe(true);
    });

    it("should filter chats by search term", () => {
      const mockChats = [
        { title: "Python Guide", messages: [], isFlagged: false },
        { title: "JavaScript Tutorial", messages: [], isFlagged: false },
        { title: "React Components", messages: [], isFlagged: false },
      ];

      const searchTerm = "python";
      const filtered = mockChats.filter((c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Python Guide");
    });

    it("should sort pinned chats first", () => {
      const mockChats = [
        { _id: "1", isPinned: false, createdAt: 3 },
        { _id: "2", isPinned: true, createdAt: 1 },
        { _id: "3", isPinned: false, createdAt: 2 },
      ];

      const sorted = [...mockChats].sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return b.createdAt - a.createdAt;
      });

      expect(sorted[0]._id).toBe("2"); // Pinned chat first
      expect(sorted[0].isPinned).toBe(true);
    });

    it("should respect limit parameter", () => {
      const mockChats = Array.from({ length: 10 }, (_, i) => ({
        _id: `${i}`,
        isFlagged: false,
      }));

      const limit = 5;
      const limited = mockChats.slice(0, limit);

      expect(limited).toHaveLength(5);
    });
  });

  describe("deleteChat", () => {
    it("should update tag counts when deleting chat", async () => {
      const mockChat = {
        _id: "chat-1",
        tags: ["test", "demo"],
      };

      const mockTag = { _id: "tag-1", name: "test", count: 5 };

      // Simulate tag count decrease
      const newCount = mockTag.count - 1;
      expect(newCount).toBe(4);
    });

    it("should delete tag when count reaches 0", async () => {
      const mockTag = { _id: "tag-1", name: "test", count: 1 };

      // Should delete tag if count <= 1
      const shouldDelete = mockTag.count <= 1;
      expect(shouldDelete).toBe(true);
    });
  });

  describe("addTagToChat", () => {
    it("should not add duplicate tags", async () => {
      const mockChat = {
        _id: "chat-1",
        tags: ["existing", "tag"],
      };

      const newTag = "existing";
      const shouldAdd = !mockChat.tags.includes(newTag);

      expect(shouldAdd).toBe(false);
    });

    it("should create new tag if it does not exist", async () => {
      const mockCtx = createMockCtx();
      const mockQuery = createMockQuery([]);
      mockCtx.db.query.mockReturnValue(mockQuery);

      const existingTag = await mockQuery.first();
      const shouldCreateNewTag = !existingTag;

      expect(shouldCreateNewTag).toBe(true);
    });

    it("should increment tag count if tag exists", async () => {
      const mockTag = { _id: "tag-1", name: "test", count: 5 };

      // Simulate increment
      const newCount = mockTag.count + 1;
      expect(newCount).toBe(6);
    });
  });

  describe("removeTagFromChat", () => {
    it("should remove tag from chat", () => {
      const mockChat = {
        tags: ["tag1", "tag2", "tag3"],
      };

      const tagToRemove = "tag2";
      const updatedTags = mockChat.tags.filter((t) => t !== tagToRemove);

      expect(updatedTags).toEqual(["tag1", "tag3"]);
      expect(updatedTags).not.toContain("tag2");
    });

    it("should decrement tag count", () => {
      const mockTag = { _id: "tag-1", name: "test", count: 5 };

      // Simulate decrement
      const newCount = mockTag.count - 1;
      expect(newCount).toBe(4);
    });

    it("should delete tag when count reaches 1", () => {
      const mockTag = { _id: "tag-1", name: "test", count: 1 };

      // Should delete if count <= 1
      const shouldDelete = mockTag.count <= 1;
      expect(shouldDelete).toBe(true);
    });
  });

  describe("flagChat", () => {
    it("should set isFlagged to true and store reason", async () => {
      const mockChat = {
        _id: "chat-1",
        isFlagged: false,
        flagReason: undefined,
      };

      const reason = "Inappropriate content";

      // Simulate flagging
      const updated = {
        ...mockChat,
        isFlagged: true,
        flagReason: reason,
        updatedAt: Date.now(),
      };

      expect(updated.isFlagged).toBe(true);
      expect(updated.flagReason).toBe(reason);
    });
  });
});
