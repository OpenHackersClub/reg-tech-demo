import { z } from 'zod';

// Document type enum in snake_case
export const DocumentTypeEnum = z.enum([
  'business_registration',
  'certificate_of_incorporation',
  'industry_licenses',
  'invoice',
  'receipt',
  'unknown',
]);

export type DocumentType = z.infer<typeof DocumentTypeEnum>;

// Classification result schema
export const DocumentClassificationSchema = z.object({
  document_type: DocumentTypeEnum,
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  secondary_classifications: z.array(DocumentTypeEnum).nullable(),
});

export type DocumentClassification = z.infer<
  typeof DocumentClassificationSchema
>;
