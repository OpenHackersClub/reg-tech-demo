import { Effect, Console } from "effect";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9000", // MinIO default endpoint
  forcePathStyle: true, // Required for MinIO
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "minioadmin",
  },
});

export function uploadDocument(bucketName: string, fileName: string, fileContent: Buffer) {
  return Effect.tryPromise({
    try: () => {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent,
      });
      return s3Client.send(command);
    },
    catch: (e) => new Error(`Failed to upload document: ${e}`),
  }).pipe(
    Effect.tap(() => Console.log(`Document ${fileName} uploaded to ${bucketName}.`))
  );
}
