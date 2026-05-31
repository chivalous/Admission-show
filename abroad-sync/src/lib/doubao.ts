const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY!;
const DOUBAO_BASE_URL = process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const DOUBAO_MODEL = process.env.DOUBAO_MODEL || 'doubao-seedance-2-0-fast-260128';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

export async function doubaoChat(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const response = await fetch(`${DOUBAO_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DOUBAO_API_KEY}`,
    },
    body: JSON.stringify({
      model: DOUBAO_MODEL,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.max_tokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Doubao API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}

export async function doubaoChatJSON<T>(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<T> {
  const systemMessage: ChatMessage = {
    role: 'system',
    content:
      'You are a JSON-only API. Always respond with valid JSON. Do not include markdown formatting, code blocks, or any text outside the JSON object.',
  };
  const text = await doubaoChat([systemMessage, ...messages], {
    temperature: options?.temperature ?? 0.1,
    max_tokens: options?.max_tokens ?? 4096,
  });
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned) as T;
}

/**
 * Analyze an image with Doubao vision model.
 * Pass a base64-encoded image (without data URI prefix) or a URL.
 */
export async function analyzeImage<T>({
  imageBase64,
  imageUrl,
  prompt,
  systemPrompt,
}: {
  imageBase64?: string;
  imageUrl?: string;
  prompt: string;
  systemPrompt?: string;
}): Promise<T> {
  const imageSource = imageBase64
    ? { type: 'image_url' as const, image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
    : { type: 'image_url' as const, image_url: { url: imageUrl! } };

  const messages: ChatMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({
    role: 'user',
    content: [imageSource, { type: 'text', text: prompt }],
  });

  return doubaoChatJSON<T>(messages);
}

/**
 * Extract text from an image of a document (CV, certificate, etc.)
 */
export async function extractTextFromImage(imageBase64: string): Promise<string> {
  return doubaoChat([
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
        },
        {
          type: 'text',
          text: '请提取这张图片中的所有文字内容，保持原有格式（包括换行、分段）。只输出文字，不要添加任何解释或介绍。如果图片是一份简历或文档，请完整保留其结构。',
        },
      ],
    },
  ]);
}
