const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chat(messages: ChatMessage[], options?: { temperature?: number; max_tokens?: number }) {
  const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.max_tokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}

export async function chatJSON<T>(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<T> {
  const systemMessage: ChatMessage = {
    role: 'system',
    content: 'You are a JSON-only API. Always respond with valid JSON. Do not include markdown formatting, code blocks, or any text outside the JSON object.',
  };
  const text = await chat([systemMessage, ...messages], {
    temperature: options?.temperature ?? 0.1,
    max_tokens: options?.max_tokens ?? 4096,
  });
  // Remove potential markdown code blocks
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned) as T;
}
