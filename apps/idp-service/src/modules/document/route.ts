import { Hono } from 'hono';

import { classifyDocument } from './service/classify.js';
import { extractReceipt } from './service/extraction.js';

const documentRoute = new Hono();

documentRoute.post('/parse/receipt', async (c) => {
  try {
    let base64: string;

    // Try to parse form data first (file upload)
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (file && file instanceof File) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return c.json(
          {
            success: false,
            error: 'Invalid file type. Please upload an image file.',
          },
          400,
        );
      }

      // Convert uploaded file to base64
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      base64 = fileBuffer.toString('base64');
    } else {
      return c.json(
        {
          success: false,
          error: 'No file uploaded.',
        },
        400,
      );
    }

    const base64Image = `data:image/jpeg;base64,${base64}`;

    const classificationResult = await classifyDocument(base64Image);

    if (classificationResult?.document_type !== 'receipt') {
      return c.json(
        {
          success: false,
          error: 'Invalid document type. Please upload a receipt image.',
          details: classificationResult,
        },
        400,
      );
    }

    const content = await extractReceipt(base64Image);

    return c.json({
      success: true,
      data: content,
      source: file ? 'uploaded' : 'default',
    });
  } catch (error) {
    console.error('Error processing receipt:', error);

    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      500,
    );
  }
});

export { documentRoute };
