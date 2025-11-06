import { LanguageModel } from '@effect/ai';
import { OpenAiClient, OpenAiLanguageModel } from '@effect/ai-openai';
import { NodeHttpClient } from '@effect/platform-node';
import { Config, Effect, Layer, Match } from 'effect';

import { CLASSIFY_PROMPT } from '../prompts/classification.js';
import { RECEIPT_PROMPT } from '../prompts/receipt.js';
import { DocumentClassificationSchema } from '../schema/classify.js';
import { ReceiptDataSchema } from '../schema/extraction.js';

const Llama4 = OpenAiLanguageModel.model('meta-llama/llama-4-maverick');

export class DocumentExtraction extends Effect.Service<DocumentExtraction>()(
  'app/documentExtraction',
  {
    effect: Effect.gen(function* () {
      const llama4 = yield* Llama4;

      const classification = (doc: Buffer<ArrayBuffer>) =>
        Effect.gen(function* () {
          const response = yield* LanguageModel.generateObject({
            prompt: [
              {
                role: 'system',
                content: CLASSIFY_PROMPT,
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Classify the following document.',
                  },
                  {
                    type: 'file',
                    data: doc,
                    mediaType: 'image/jpeg',
                    options: {
                      openai: {
                        imageDetail: 'auto',
                      },
                    },
                  },
                ],
              },
            ],
            schema: DocumentClassificationSchema,
          });
          return response.value;
        });

      const extraction = (doc: Buffer<ArrayBuffer>) =>
        Effect.gen(function* () {
          const response = yield* LanguageModel.generateObject({
            prompt: [
              {
                role: 'system',
                content: RECEIPT_PROMPT,
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Please extract all data from this receipt image and return it in the structured format.',
                  },
                  {
                    type: 'file',
                    data: doc,
                    mediaType: 'image/jpeg',
                    options: {
                      openai: {
                        imageDetail: 'auto',
                      },
                    },
                  },
                ],
              },
            ],
            schema: ReceiptDataSchema,
          });
          return response.value;
        });

      return {
        extraction: (doc: Buffer<ArrayBuffer>) =>
          Effect.provide(extraction(doc), llama4),
        classification: (doc: Buffer<ArrayBuffer>) =>
          Effect.provide(classification(doc), llama4),
      };
    }),
  },
) {}

export async function extractDocument(doc: Buffer<ArrayBuffer>) {
  const OpenAi = OpenAiClient.layerConfig({
    apiKey: Config.redacted('OPENAI_API_KEY'),
    apiUrl: Config.string('OPENAI_API_BASE_URL'),
  });

  const OpenAiWithHttp = Layer.provide(OpenAi, NodeHttpClient.layerUndici);

  const documentExtraction = Effect.gen(function* () {
    const service = yield* DocumentExtraction;
    const classification = yield* service.classification(doc);

    const matcher = Match.value(classification.document_type).pipe(
      Match.when('receipt', function* () {
        return yield* service.extraction(doc);
      }),

      Match.orElse(() => {
        throw new Error('Unknown document type');
      }),
    );

    const result = yield* matcher;
    return result;
  });

  const DocumentExtractionLayer = Layer.provide(
    DocumentExtraction.Default,
    OpenAiWithHttp,
  );

  return Effect.runPromise(
    Effect.provide(documentExtraction, DocumentExtractionLayer),
  );
}
