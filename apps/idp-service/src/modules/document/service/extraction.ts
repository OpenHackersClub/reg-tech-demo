import { zodResponseFormat } from 'openai/helpers/zod.js';

import { openAi } from '@/service/ai.js';

import { RECEIPT_PROMPT } from '../prompts/receipt.js';
import { ReceiptDataSchema } from '../schema/receipt.js';

type Base64String = string;

export async function extractReceipt(doc: Base64String) {
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
              url: doc,
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

  const content = resp.choices[0].message.parsed;

  return content;
}
