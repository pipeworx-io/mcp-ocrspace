interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * OCR.space MCP — wraps the OCR.space API (ocr.space) for image/PDF → text OCR.
 *
 * Tools:
 * - extract_text: OCR an image or PDF from a URL and return the recognized text.
 *
 * Dual key model: pass your own OCR.space key via _apiKey for higher limits, or
 * omit it to use the shared Pipeworx key. The key is sent as the `apikey` query param.
 */


const BASE_URL = 'https://api.ocr.space';

const tools: McpToolExport['tools'] = [
  {
    name: 'extract_text',
    description:
      'Extract text from an image or PDF via OCR — pass an image/PDF URL, get the recognized text. Useful for reading screenshots, scanned documents, receipts, signs. Engine 2 is best for most cases.',
    inputSchema: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: 'URL of an image or PDF to run OCR on.',
        },
        language: {
          type: 'string',
          description: "Language code for OCR (default 'eng'). Examples: 'eng', 'fre', 'ger', 'spa'.",
        },
        engine: {
          type: 'number',
          description: 'OCR engine to use: 1, 2, or 3 (default 2). Engine 2 is best for most cases.',
        },
        is_table: {
          type: 'boolean',
          description: 'Set true to improve layout detection for tables/receipts (default false).',
        },
        _apiKey: {
          type: 'string',
          description:
            'Optional — your own OCR.space API key for higher limits; omit to use the shared Pipeworx key.',
        },
      },
      required: ['image_url'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = args._apiKey as string;
  delete args._apiKey;

  switch (name) {
    case 'extract_text':
      return extractText(
        args.image_url as string,
        (args.language as string | undefined) ?? 'eng',
        (args.engine as number | undefined) ?? 2,
        (args.is_table as boolean | undefined) ?? false,
        apiKey,
      );
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function extractText(
  imageUrl: string,
  language: string,
  engine: number,
  isTable: boolean,
  apiKey: string,
) {
  if (!apiKey) {
    return { error: 'api_key_required', message: 'No OCR.space key available.' };
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    url: imageUrl,
    language,
    OCREngine: String(engine),
    isTable: String(isTable),
    isOverlayRequired: 'false',
  });

  const res = await fetch(`${BASE_URL}/parse/imageurl?${params}`);
  if (!res.ok) {
    const text = await res.text();
    return { error: res.status, message: text };
  }

  const data = (await res.json()) as {
    ParsedResults?: Array<{ ParsedText?: string }>;
    OCRExitCode?: number;
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string | string[];
  };

  if (data.IsErroredOnProcessing) {
    const msg = Array.isArray(data.ErrorMessage)
      ? data.ErrorMessage.join('; ')
      : data.ErrorMessage ?? 'OCR processing failed.';
    return { error: 'ocr_failed', message: msg };
  }

  const results = data.ParsedResults ?? [];
  return {
    text: results
      .map((r) => r.ParsedText ?? '')
      .join('\n')
      .slice(0, 100000),
    pages: results.length,
    exit_code: data.OCRExitCode,
  };
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
