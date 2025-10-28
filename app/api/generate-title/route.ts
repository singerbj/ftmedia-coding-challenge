import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    // Validate messages
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create a summary of the conversation for title generation
    const conversationSummary = messages
      .map((msg) => `${msg.role}: ${msg.content.substring(0, 100)}`)
      .join("\n");

    // Generate title using ai package with OpenAI provider
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a helpful assistant that generates concise, descriptive titles for chat conversations. Generate a short title (5-8 words max) that captures the main topic of the conversation. Return ONLY the title, nothing else.",
      prompt: `Generate a title for this chat conversation:\n\n${conversationSummary}`,
      temperature: 0.7,
    });

    const title = text.trim() || `Chat - ${new Date().toLocaleDateString()}`;

    return new Response(JSON.stringify({ title }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate title API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate title",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
