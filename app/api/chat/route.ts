import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Convert UIMessages to ModelMessages
    const modelMessages = convertToModelMessages(messages);

    // Create UI message stream
    const stream = createUIMessageStream({
      originalMessages: messages,
      generateId,
      async execute({ writer }) {
        const result = streamText({
          model: openai("gpt-4o-mini"),
          system:
            "You are a helpful AI assistant for an internal team dashboard. Provide clear, concise, and useful answers. Keep responses focused and actionable.",
          messages: modelMessages,
        });

        const messageId = generateId();

        // Write text-start marker
        writer.write({
          type: "text-start",
          id: messageId,
        });

        // Stream text chunks as they come in
        for await (const chunk of result.textStream) {
          writer.write({
            type: "text-delta",
            delta: chunk,
            id: messageId,
          });
        }

        // Write text-end marker
        writer.write({
          type: "text-end",
          id: messageId,
        });
      },
    });

    // Return the stream response
    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
