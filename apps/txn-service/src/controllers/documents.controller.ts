import { Effect, Console } from "effect";
import { HttpServer, HttpServerRouter, HttpServerResponse, Multipart } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { uploadDocument } from "../services/document-upload.service";
import { processDocument } from "../workers/document-processing.worker";
import { db } from "../../src/db";
import { clientDocuments } from "../../src/db/schema";

export const documentsController = HttpServerRouter.empty.pipe(
  HttpServerRouter.post(
    "/documents/upload",
    Effect.gen(function* (_) {
      const request = yield* _(HttpServer.request.ServerRequest);
      const parts = yield* _(request.multipart);

      const filePart = parts.find((part) => part._tag === "File" && part.key === "document");

      if (!filePart || filePart._tag !== "File") {
        return HttpServerResponse.badRequest("No document file found.");
      }

      const fileContent = yield* _(filePart.stream.pipe(
        NodeHttpServer.multipart.toBuffer
      ));

      const documentId = `doc-${Math.random().toString(36).substring(7)}`;
      const fileName = filePart.filename || `document-${documentId}.bin`;
      const bucketName = "client-documents"; // Replace with your MinIO bucket name

      yield* _(uploadDocument(bucketName, fileName, fileContent));

      yield* _(Effect.promise(() => db.insert(clientDocuments).values({
        id: documentId,
        clientId: "client-123", // Placeholder client ID
        fileName: fileName,
        filePath: `${bucketName}/${fileName}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).execute()));

      yield* _(processDocument(documentId, `${bucketName}/${fileName}`));

      return HttpServerResponse.json({ documentId, fileName, message: "Document uploaded and processing initiated." });
    })
  )
);
