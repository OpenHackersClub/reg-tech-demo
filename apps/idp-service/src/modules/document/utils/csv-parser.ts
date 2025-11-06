import { Readable } from 'node:stream';
import csvParser from 'csv-parser';

export async function parseCsv(rawCsv: Buffer<ArrayBuffer>): Promise<string> {
  return await new Promise((resolve, reject) => {
    const rows: Record<string, unknown>[] = [];

    const buffer = Buffer.isBuffer(rawCsv)
      ? (rawCsv as unknown as Buffer)
      : Buffer.from(rawCsv as unknown as ArrayBuffer);

    const readable = Readable.from([buffer]);

    readable
      .pipe(csvParser())
      .on('data', (data) => {
        rows.push(data as Record<string, unknown>);
      })
      .on('end', () => {
        resolve(JSON.stringify(rows));
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}
