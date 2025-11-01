"use client";

import React, { useEffect, useState } from 'react';

interface ClientDocument {
  id: string;
  clientId: string;
  fileName: string;
  filePath: string;
  analysisResults: any;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('http://localhost:3000/documents'); // Assuming API runs on port 3000
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ClientDocument[] = await response.json();
        setDocuments(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
    const interval = setInterval(fetchDocuments, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading documents...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Client Documents</h1>
      {documents.length === 0 ? (
        <p>No documents to display.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">File: {doc.fileName}</h2>
              <p><strong>Client ID:</strong> {doc.clientId}</p>
              <p><strong>Path:</strong> {doc.filePath}</p>
              <p><strong>Analysis:</strong> {JSON.stringify(doc.analysisResults)}</p>
              <p className="text-sm text-gray-500">Uploaded: {new Date(doc.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
