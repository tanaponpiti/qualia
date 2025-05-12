import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { AIClient } from '$lib/server/aiClient';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const text = body.text;

    if (typeof text !== 'string') {
      return json({ error: 'Invalid input: text must be a string' }, { status: 400 });
    }

    const client = new AIClient();
    const result = await client.processText(text);

    // For now, just echo back the received text or a success message
    return json(result, { status: 200 });

  } catch (error) {
    console.error("Error processing MCP request:", error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
