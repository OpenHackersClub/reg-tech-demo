import { LanguageModel } from '@effect/ai';
import type { UserMessagePartEncoded } from '@effect/ai/Prompt';
import { OpenAiLanguageModel } from '@effect/ai-openai';
import { Effect, Layer, Match, Schema } from 'effect';

import { OtelLayer } from '@/modules/langfuse/layer';
import { OpenAiWithHttp } from '@/service/ai';

import { BUSINESS_REGISTRATION_PROMPT } from '../prompts/business-registration';
import { CERTIFICATE_OF_INCORPORATION_PROMPT } from '../prompts/ci';
import { INDUSTRY_LICENSE_PROMPT } from '../prompts/industry-license';
import { INVOICE_PROMPT } from '../prompts/invoice';
import { RECEIPT_PROMPT } from '../prompts/receipt';
import { DocumentTypeSchema } from '../schema/classify';
import {
  BusinessRegistrationDataSchema,
  CertificateOfIncorporationDataSchema,
  IndustryLicenseDataSchema,
  InvoiceDataSchema,
  ReceiptDataSchema,
} from '../schema/extraction';
import { classification } from './classify';

const DocType = DocumentTypeSchema.pipe(
  Schema.pickLiteral(
    'business_registration',
    'certificate_of_incorporation',
    'industry_licenses',
    'invoice',
    'receipt',
  ),
);

const Llama4 = OpenAiLanguageModel.model('meta-llama/llama-4-maverick');

export type ExtractionDocument = {
  file: Buffer<ArrayBuffer>;
  mediaType: string;
};

type ExtractionParams = {
  docs?: ExtractionDocument[];
  docString?: string;
  type: typeof DocType.Type;
};

const extraction = (params: ExtractionParams) =>
  Effect.gen(function* () {
    // Add trace-level metadata
    yield* Effect.annotateCurrentSpan({
      'langfuse.trace.name': 'document-extraction',
      'langfuse.trace.userId': 'iyansr', // Add if you have user context
      'langfuse.trace.sessionId': 'test-session', // Add if you track sessions
      'langfuse.trace.metadata.document_type': params.type,
      'langfuse.trace.metadata.doc_count': params.docs?.length || 0,
      'langfuse.trace.tags': JSON.stringify(['extraction', params.type]),
    });

    const promptMatcher = Match.value(params.type).pipe(
      Match.when('receipt', () => RECEIPT_PROMPT),
      Match.when('business_registration', () => BUSINESS_REGISTRATION_PROMPT),
      Match.when(
        'certificate_of_incorporation',
        () => CERTIFICATE_OF_INCORPORATION_PROMPT,
      ),
      Match.when('industry_licenses', () => INDUSTRY_LICENSE_PROMPT),
      Match.when('invoice', () => INVOICE_PROMPT),
      Match.exhaustive,
    );

    const schemaMatcher = Match.value(params.type).pipe(
      Match.when('receipt', () => ReceiptDataSchema),
      Match.when('business_registration', () => BusinessRegistrationDataSchema),
      Match.when(
        'certificate_of_incorporation',
        () => CertificateOfIncorporationDataSchema,
      ),
      Match.when('industry_licenses', () => IndustryLicenseDataSchema),
      Match.when('invoice', () => InvoiceDataSchema),
      Match.exhaustive,
    );

    const userContent: UserMessagePartEncoded[] = [];

    if (params.docs && params.docs.length > 0) {
      userContent.push({
        type: 'text',
        text: 'Please extract all data from these documents and return it in the structured format.',
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
        text: `Please extract all data from these documents and return it in the structured format. Document content: ${params.docString}`,
      });
    }

    const input = userContent.map((item) => ({
      type: item.type,
      text: item.type === 'text' ? item.text : undefined,
      mediaType: item.type === 'file' ? item.mediaType : undefined,
    }));

    yield* Effect.annotateCurrentSpan({
      'langfuse.observation.input': JSON.stringify(input),
    });

    const response = yield* LanguageModel.generateObject({
      prompt: [
        {
          role: 'system',
          content: promptMatcher,
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
      //@ts-expect-error
      schema: schemaMatcher,
      objectName: 'extraction_result',
    });

    // Add output annotation
    yield* Effect.annotateCurrentSpan({
      'langfuse.observation.output': JSON.stringify(response.value),
    });

    return { input, output: response.value };
  }).pipe(
    Effect.withSpan('document-extraction', {
      attributes: {
        'operation.type': 'extraction',
        'document.type': params.type,
      },
    }),
  );

export class DocumentExtraction extends Effect.Service<DocumentExtraction>()(
  'app/documentExtraction',
  {
    effect: Effect.gen(function* () {
      const llama4 = yield* Llama4;

      return {
        extraction: (params: ExtractionParams) =>
          Effect.provide(extraction(params), llama4),
        classification: (params: Omit<ExtractionParams, 'type'>) =>
          Effect.provide(classification(params), llama4),
      };
    }),
  },
) {}

export async function extractDocument(params: Omit<ExtractionParams, 'type'>) {
  const documentExtraction = Effect.gen(function* () {
    const service = yield* DocumentExtraction;
    const classification = yield* service.classification({
      docs: params.docs,
      docString: params.docString,
    });

    if (
      classification.document_type === 'unknown' ||
      classification.confidence < 0.7
    ) {
      return {
        classification,
      };
    }

    const result = yield* service.extraction({
      type: classification.document_type as typeof DocType.Type,
      docs: params.docs,
      docString: params.docString,
    });
    return {
      ...result.output,
      classification,
    };
  });

  const DocumentExtractionLayer = Layer.provide(
    DocumentExtraction.Default,
    OpenAiWithHttp,
  );

  return Effect.runPromise(
    documentExtraction.pipe(
      Effect.provide(DocumentExtractionLayer),
      Effect.provide(OtelLayer),
    ),
  );
}
