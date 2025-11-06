import type { ExtractionDocument } from '../service/extraction';
import { parseCsv } from './csv-parser';
import { pdfToImage } from './pdf-to-image';

type ValidationResult = {
  docs?: ExtractionDocument[];
  docString?: string;
  error?: string;
};

export async function validateFileEntry(
  fileEntry: FormDataEntryValue | null,
): Promise<ValidationResult> {
  if (!fileEntry || !(fileEntry instanceof File)) {
    return { error: 'No file uploaded.' };
  }

  const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const csvTypes = ['text/csv', 'application/csv', 'application/vnd.ms-excel'];

  const fileArrayBuffer = (await fileEntry.arrayBuffer()) as ArrayBuffer;
  const fileBuffer = Buffer.from(
    fileArrayBuffer,
  ) as unknown as Buffer<ArrayBuffer>;

  if (imageTypes.includes(fileEntry.type)) {
    return {
      docs: [
        {
          mediaType: fileEntry.type,
          file: fileBuffer,
        },
      ],
    };
  }

  if (fileEntry.type === 'application/pdf') {
    const images = await pdfToImage(
      fileBuffer as unknown as Buffer<ArrayBuffer>,
    );
    if (images.length === 0) {
      return { error: 'Failed to convert PDF to images.' };
    }

    const docs: ExtractionDocument[] = images.map((img) => ({
      mediaType: 'image/png',
      file: img as unknown as Buffer<ArrayBuffer>,
    }));

    return { docs };
  }

  if (csvTypes.includes(fileEntry.type)) {
    const docString = await parseCsv(fileBuffer);
    return { docString };
  }

  return {
    error: 'Invalid file type. Please upload an image, PDF, or CSV file.',
  };
}
