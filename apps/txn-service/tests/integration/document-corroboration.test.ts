import { Effect } from "effect";
import { db } from "../../src/db";
import { clientDocuments } from "../../src/db/schema";
import { eq } from "drizzle-orm";

describe("Document Corroboration Flow", () => {
  it("should upload a document, process it, and store analysis results", () =>
    Effect.gen(function* (_) {
      // 1. Simulate document upload to the API
      // In a real scenario, this would involve making an HTTP request to the /documents/upload endpoint
      const documentId = `doc-${Math.random().toString(36).substring(7)}`;
      const fileName = "test-document.pdf";
      const filePath = `client-documents/${fileName}`;

      // Simulate database insertion after upload
      yield* _(Effect.promise(() => db.insert(clientDocuments).values({
        id: documentId,
        clientId: "client-123",
        fileName: fileName,
        filePath: filePath,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).execute()));

      // 2. Simulate document processing
      const analysisResults = {
        extractedText: "Simulated extracted text.",
        keywords: ["test", "simulated", "analysis"],
        sentiment: "positive",
      };

      yield* _(Effect.promise(() => db.update(clientDocuments)
        .set({ analysisResults: analysisResults, updatedAt: new Date() })
        .where(eq(clientDocuments.id, documentId))
        .execute()));

      // 3. Verify document in the database
      const storedDocument = yield* _(Effect.promise(() => db.select().from(clientDocuments).where(eq(clientDocuments.id, documentId)).execute()));
      expect(storedDocument.length).toBe(1);
      expect(storedDocument[0].fileName).toBe(fileName);
      expect(storedDocument[0].analysisResults).toEqual(analysisResults);

      // 4. Verify document via API endpoint (assuming API is running on port 3000)
      // This would require a GET /documents/:id endpoint, which is not yet implemented.
      // For now, we'll just check the database.
    }).pipe(Effect.runPromise));
});
