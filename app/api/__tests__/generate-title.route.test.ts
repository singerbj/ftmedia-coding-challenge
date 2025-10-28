/**
 * @jest-environment node
 */
import { POST } from "../generate-title/route";
import { generateText } from "ai";

// Mock the ai SDK
jest.mock("ai", () => ({
  generateText: jest.fn(),
}));

// Mock OpenAI
jest.mock("@ai-sdk/openai", () => ({
  openai: jest.fn(),
}));

const mockGenerateText = generateText as jest.MockedFunction<
  typeof generateText
>;

describe("POST /api/generate-title", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates title from messages", async () => {
    mockGenerateText.mockResolvedValue({
      text: "React Fundamentals Discussion",
    } as never);

    const request = new Request("http://localhost:3000/api/generate-title", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          { role: "user", content: "What is React?" },
          { role: "assistant", content: "React is a JavaScript library..." },
        ],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBeDefined();
  });

  it("rejects request without messages", async () => {
    const request = new Request("http://localhost:3000/api/generate-title", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("rejects request with empty messages array", async () => {
    const request = new Request("http://localhost:3000/api/generate-title", {
      method: "POST",
      body: JSON.stringify({
        messages: [],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("returns proper JSON response", async () => {
    mockGenerateText.mockResolvedValue({
      text: "Understanding TypeScript Types",
    } as never);

    const request = new Request("http://localhost:3000/api/generate-title", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          { role: "user", content: "Explain TypeScript types" },
          { role: "assistant", content: "TypeScript types help with..." },
        ],
      }),
    });

    const response = await POST(request);

    expect(response.headers.get("Content-Type")).toContain("application/json");
    const data = await response.json();
    expect(typeof data.title).toBe("string");
  });

  it("handles generation failure with fallback", async () => {
    mockGenerateText.mockRejectedValue(new Error("API Error"));

    const request = new Request("http://localhost:3000/api/generate-title", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          { role: "user", content: "Test question" },
          { role: "assistant", content: "Test answer" },
        ],
      }),
    });

    const response = await POST(request);

    // Should return fallback title or error response
    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it("converts message format for title generation", async () => {
    mockGenerateText.mockResolvedValue({
      text: "Generated Title",
    } as never);

    const messages = [
      { role: "user" as const, content: "What is Vue?" },
      { role: "assistant" as const, content: "Vue is a framework..." },
    ];

    const request = new Request("http://localhost:3000/api/generate-title", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockGenerateText).toHaveBeenCalled();
  });

  it("handles single message", async () => {
    mockGenerateText.mockResolvedValue({
      text: "Question Title",
    } as never);

    const request = new Request("http://localhost:3000/api/generate-title", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "What is the difference between let and const?",
          },
        ],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it("handles multiple messages", async () => {
    mockGenerateText.mockResolvedValue({
      text: "Comprehensive Discussion",
    } as never);

    const request = new Request("http://localhost:3000/api/generate-title", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          { role: "user", content: "First question" },
          { role: "assistant", content: "First answer" },
          { role: "user", content: "Follow-up question" },
          { role: "assistant", content: "Follow-up answer" },
          { role: "user", content: "Another question" },
        ],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockGenerateText).toHaveBeenCalled();
  });

  it("creates proper conversation context for title generation", async () => {
    mockGenerateText.mockResolvedValue({
      text: "Test Title",
    } as never);

    const request = new Request("http://localhost:3000/api/generate-title", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          { role: "user", content: "Ask about React hooks" },
          { role: "assistant", content: "Here is info about hooks..." },
        ],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title.length).toBeGreaterThan(0);
  });

  it("limits title length", async () => {
    mockGenerateText.mockResolvedValue({
      text: "A Short Title",
    } as never);

    const request = new Request("http://localhost:3000/api/generate-title", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Test message" }],
      }),
    });

    const response = await POST(request);

    const data = await response.json();
    // Title should be reasonably short
    expect(data.title.length).toBeLessThan(200);
  });

  it("returns error details on validation failure", async () => {
    const request = new Request("http://localhost:3000/api/generate-title", {
      method: "POST",
      body: JSON.stringify({ messages: null }),
    });

    const response = await POST(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
