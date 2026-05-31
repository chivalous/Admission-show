import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage, extractTextFromImage } from '@/lib/doubao';

/**
 * POST /api/vision
 *
 * Body:
 * - image: base64 image string (required)
 * - mode: 'extract' | 'analyze' (default: 'extract')
 * - prompt: custom prompt (only for 'analyze' mode)
 * - systemPrompt: system instruction (optional)
 *
 * Response:
 * - mode='extract': { text: string }
 * - mode='analyze': { result: T } (JSON based on prompt)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, mode = 'extract', prompt, systemPrompt } = body;

    if (!image) {
      return NextResponse.json({ error: '缺少 image 参数（base64 图片）' }, { status: 400 });
    }

    // Clean base64: remove data URI prefix if present
    const imageBase64 = image.replace(/^data:image\/\w+;base64,/, '');

    if (mode === 'extract') {
      const text = await extractTextFromImage(imageBase64);
      return NextResponse.json({ text });
    }

    if (mode === 'analyze') {
      if (!prompt) {
        return NextResponse.json({ error: 'analyze 模式需要提供 prompt 参数' }, { status: 400 });
      }
      const result = await analyzeImage({ imageBase64, prompt, systemPrompt });
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: `未知 mode: ${mode}，支持 extract / analyze` }, { status: 400 });
  } catch (error) {
    console.error('/api/vision error:', error);
    const message = error instanceof Error ? error.message : '视觉识别失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
