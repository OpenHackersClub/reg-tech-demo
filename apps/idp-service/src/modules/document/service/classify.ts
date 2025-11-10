import { LanguageModel } from '@effect/ai';
import type { UserMessagePartEncoded } from '@effect/ai/Prompt';
import { OpenAiLanguageModel } from '@effect/ai-openai';
import { Effect } from 'effect';

import { OtelLayer } from '@/modules/langfuse/layer';
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

    yield* Effect.annotateCurrentSpan({
      'langfuse.trace.name': 'document-classification',
      'langfuse.trace.userId': 'iyansr', // Add if you have user context
      'langfuse.trace.sessionId': 'test-session', // Add if you track sessions
      'langfuse.trace.metadata.doc_count': params.docs?.length || 0,
      'langfuse.trace.tags': JSON.stringify(['classification']),
    });

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

    // Add input annotation
    yield* Effect.annotateCurrentSpan({
      'langfuse.observation.input': userContent.map((item) => ({
        type: item.type,
        text: item.type === 'text' ? item.text : undefined,
        mediaType: item.type === 'file' ? item.mediaType : undefined,
      })),
    });

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

    // Add output annotation
    yield* Effect.annotateCurrentSpan({
      'langfuse.observation.output': JSON.stringify(response.value),
    });

    return response.value;
  }).pipe(Effect.withSpan('document-classification'));

export async function classifyDocumentLayer(params: ClassificationParams) {
  const Llama4 = OpenAiLanguageModel.model('meta-llama/llama-4-maverick');

  const program = classification(params).pipe(
    Effect.provide(Llama4),
    Effect.provide(OpenAiWithHttp),
    Effect.provide(OtelLayer),
  );

  return Effect.runPromise(program);
}
