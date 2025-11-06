import { Hono } from 'hono';

import { extractDocument } from './service/extraction.js';

const documentRoute = new Hono();

documentRoute.post('/parse/receipt/effect', async (c) => {
  try {
    // Try to parse form data first (file upload)
    const formData = await c.req.formData();
    const file = formData.get('file');

    let doc: Buffer<ArrayBuffer>;

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
      doc = fileBuffer;
    } else {
      return c.json(
        {
          success: false,
          error: 'No file uploaded.',
        },
        400,
      );
    }

    const content = await extractDocument(doc);

    if (!content) {
      return c.json(
        {
          success: false,
          error: 'No content extracted.',
        },
        400,
      );
    }

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
