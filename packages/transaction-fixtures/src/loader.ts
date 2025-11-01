import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  sender_id: string;
  receiver_id: string;
  timestamp: string;
}

export async function loadTransactions(filePath: string): Promise<Transaction[]> {
  const csvFilePath = path.resolve(filePath);
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  return new Promise((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      cast: true,
      trim: true,
    }, (error, result: Transaction[]) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
