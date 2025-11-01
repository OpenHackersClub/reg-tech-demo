import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/documents";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Client Documents - RegTech Demo" },
    {
      name: "description",
      content: "View and manage client documents",
    },
  ];
}

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
        const response = await fetch("http://localhost:3000/documents");
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
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="p-4">Loading documents...</p>;
  if (error) return <p className="p-4">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Documents</h1>
        <Link
          to="/tooljet"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Upload Document
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Home
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No documents to display.</p>
          <Link
            to="/tooljet"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Upload Your First Document
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-2">
                File: {doc.fileName}
              </h2>
              <p>
                <strong>Client ID:</strong> {doc.clientId}
              </p>
              <p>
                <strong>Path:</strong> {doc.filePath}
              </p>
              <p>
                <strong>Analysis:</strong> {JSON.stringify(doc.analysisResults)}
              </p>
              <p className="text-sm text-gray-500">
                Uploaded: {new Date(doc.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
