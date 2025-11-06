import { pdf } from 'pdf-to-img';

export interface PdfToImageOptions {
  scale?: number;
  password?: string;
}

/**
 * Converts PDF buffer to an array of image buffers (PNG format)
 * @param doc - PDF document as Buffer
 * @param options - Conversion options including scale and password
 * @returns Promise<Buffer[]> - Array of image buffers in page order
 */
export async function pdfToImage(
  doc: Buffer<ArrayBuffer>,
  options: PdfToImageOptions = {},
): Promise<Buffer[]> {
  const { scale = 2, password } = options;

  // Convert Buffer to base64 data URL for pdf-to-img library
  const base64 = doc.toString('base64');
  const dataUrl = `data:application/pdf;base64,${base64}`;

  try {
    const document = await pdf(dataUrl, {
      scale,
      password,
    });

    const images: Buffer[] = [];

    // Convert each page to image buffer (PNG format by default)
    for await (const imageBuffer of document) {
      images.push(imageBuffer);
    }

    return images;
  } catch (error) {
    throw new Error(
      `Failed to convert PDF to images: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
