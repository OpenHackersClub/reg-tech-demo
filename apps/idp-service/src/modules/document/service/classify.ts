import { LanguageModel } from '@effect/ai';
import type { UserMessagePartEncoded } from '@effect/ai/Prompt';
import { OpenAiLanguageModel } from '@effect/ai-openai';
import { Effect } from 'effect';

import { OpenAiWithHttp } from '@/service/ai';

import { CLASSIFY_PROMPT } from '../prompts/classification';
import { DocumentClassificationSchema } from '../schema/classify';

type ClassificationParams = {
  docs?: {
    file: Buffer<ArrayBuffer>;
    mediaType: string;
  }[];
  docString?: string;
};

export const classification = (params: ClassificationParams) =>
  Effect.gen(function* () {
    const userContent: UserMessagePartEncoded[] = [];

    if (params.docs && params.docs.length > 0) {
      userContent.push({
        type: 'text',
        text: 'Please classify data from these documents and return it in the structured format.',
      });

      for (const doc of params.docs) {
        userContent.push({
          type: 'file',
          data: doc.file,
          mediaType: doc.mediaType,
          options: {
            openai: {
              imageDetail: 'auto',
            },
          },
        });
      }
    }

    if (params.docString) {
      userContent.push({
        type: 'text',
        text: `Please classify data from these documents and return it in the structured format. Document content: ${params.docString}`,
      });
    }

    const response = yield* LanguageModel.generateObject({
      prompt: [
        {
          role: 'system',
          content: CLASSIFY_PROMPT,
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
      objectName: 'classify_result',
      schema: DocumentClassificationSchema,
    });
    return response.value;
  });

export async function classifyDocumentLayer(params: ClassificationParams) {
  const Llama4 = OpenAiLanguageModel.model('meta-llama/llama-4-maverick');

  const program = Effect.gen(function* () {
    const llama4 = yield* Llama4;
    const classificationResult = yield* Effect.provide(
      classification(params),
      llama4,
    );
    return classificationResult;
  });

  return Effect.runPromise(Effect.provide(program, OpenAiWithHttp));
}
