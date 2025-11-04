import { Hono } from 'hono';
import { zodResponseFormat } from 'openai/helpers/zod.js';

import { openAi } from '@/service/ai.js';

import { RECEIPT_PROMPT } from './prompt.js';
import { ReceiptDataSchema } from './schema/receipt.js';

const documentRoute = new Hono();

documentRoute.post('/parse/receipt', async (c) => {
  try {
    let base64: string;

    // Try to parse form data first (file upload)
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (file && file instanceof File) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return c.json(
          {
            success: false,
            error: 'Invalid file type. Please upload an image file.',
          },
          400,
        );
      }

      // Convert uploaded file to base64
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      base64 = fileBuffer.toString('base64');
    } else {
      return c.json(
        {
          success: false,
          error: 'No file uploaded.',
        },
        400,
      );
    }

    const resp = await openAi.chat.completions.parse({
      model: 'meta-llama/llama-4-maverick',
      messages: [
        { role: 'system', content: RECEIPT_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please extract all data from this receipt image and return it in the structured format.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
                detail: 'auto',
              },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(ReceiptDataSchema, 'receipt_data'),
      temperature: 0.1,
      max_tokens: 4000,
    });

    const content = resp.choices[0].message;

    return c.json({
      success: true,
      data: content.parsed,
      source: file ? 'uploaded' : 'default',
    });
  } catch (error) {
    console.error('Error processing receipt:', error);

    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      500,
    );
  }
});

export { documentRoute };
