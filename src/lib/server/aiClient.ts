import {
  createGoogleGenerativeAI,
  type GoogleGenerativeAIProvider,
} from "@ai-sdk/google";
import { env } from "$env/dynamic/private";
import {
  experimental_createMCPClient,
  generateText,
  streamText,
  type LanguageModel,
  type ToolSet,
  type CoreMessage,
} from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
export class AIClient {
  apiKey: string = env.GOOGLE_API_KEY;
  model: LanguageModel;

  constructor() {
    this.apiKey = env.GOOGLE_API_KEY;
    if (!this.apiKey) {
      console.error("GOOGLE_API_KEY is not set in environment variables.");
      throw new Error("API key not configured.");
    }
    const google = createGoogleGenerativeAI({
      apiKey: this.apiKey,
    });
    this.model = google("models/gemini-2.0-flash");
  }

  async processText(text: string): Promise<any> {
    const transport = new Experimental_StdioMCPTransport({
      command: "npx",
      args: [
        "-y",
        "@modelcontextprotocol/server-redis",
        "redis://localhost:6379",
      ],
    });
    const redisMCPClient = await experimental_createMCPClient({
      transport,
    });
    const redisTools = await redisMCPClient.tools();
    try {
      const messages: CoreMessage[] = [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: text,
        },
      ];
      const response = await generateText({
        maxSteps: 10,
        model: this.model,
        tools: { ...redisTools },
        messages,
        onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
          console.log("Step finished:", {
            text,
            toolCalls,
            toolResults,
            finishReason,
            usage,
          });
        },
      });
      return { success: true, text: response.text };
    } catch (error) {
      console.error("Error calling AI SDK:", error);
      return { success: false, error: "Failed to process text with AI SDK." };
    } finally {
      await redisMCPClient.close();
    }
  }
}
