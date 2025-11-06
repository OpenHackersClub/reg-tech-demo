import { Hono } from 'hono';

import { classifyDocumentLayer } from './service/classify';
import { extractDocument } from './service/extraction';
import { validateFileEntry } from './utils/validate-file';

const documentRoute = new Hono();

documentRoute.post('/parse', async (c) => {
  try {
    const formData = await c.req.formData();
    const result = await validateFileEntry(formData.get('file'));

    if (result.error) {
      return c.json({ success: false, error: result.error }, 400);
    }

    const content = await extractDocument({
      docs: result.docs,
      docString: result.docString,
    });

    if (!content) {
      return c.json({ success: false, error: 'No content extracted.' }, 400);
    }

    return c.json({ success: true, data: content });
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

documentRoute.post('/classify', async (c) => {
  try {
    const formData = await c.req.formData();
    const result = await validateFileEntry(formData.get('file'));

    if (result.error) {
      return c.json({ success: false, error: result.error }, 400);
    }

    const content = await classifyDocumentLayer({
      docs: result.docs,
      docString: result.docString,
    });

    if (!content) {
      return c.json(
        { success: false, error: 'No classification result.' },
        400,
      );
    }

    return c.json({ success: true, data: content });
  } catch (error) {
    console.error('Error classifying document:', error);
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
