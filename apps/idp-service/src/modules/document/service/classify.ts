import { zodResponseFormat } from 'openai/helpers/zod.js';

import { openAi } from '@/service/ai.js';

import { CLASSIFY_PROMPT } from '../prompts/classification.js';
import { DocumentClassificationSchema } from '../schema/classify.js';

type Base64String = string;

export async function classifyDocument(doc: Base64String) {
  const resp = await openAi.chat.completions.parse({
    model: 'meta-llama/llama-4-maverick',
    messages: [
      { role: 'system', content: CLASSIFY_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Classify the following document:',
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
    response_format: zodResponseFormat(
      DocumentClassificationSchema,
      'classification',
    ),
    temperature: 0.1,
    max_tokens: 4000,
  });

  const content = resp.choices[0].message.parsed;

  return content;
}
