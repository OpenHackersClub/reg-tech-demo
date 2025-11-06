import { Schema } from 'effect';

export const DocumentTypeSchema = Schema.Literal(
  'business_registration',
  'certificate_of_incorporation',
  'industry_licenses',
  'invoice',
  'receipt',
  'unknown',
);

export const DocumentClassificationSchema = Schema.Struct({
  document_type: DocumentTypeSchema,
  confidence: Schema.Number,
  reasoning: Schema.String,
  secondary_classifications: Schema.Array(DocumentTypeSchema),
});
