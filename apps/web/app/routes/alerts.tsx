import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/alerts";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Alerts - RegTech Demo" },
    {
      name: "description",
      content: "Real-time transaction monitoring and compliance alerts",
    },
  ];
}

interface Alert {
  id: string;
  priority: "high" | "medium" | "low";
  type: string;
  status: "open" | "in_progress" | "closed";
  assignedTo?: string;
  transactionId?: string;
  clientDocumentId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("http://localhost:3000/alerts");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Alert[] = await response.json();
        setAlerts(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="p-4">Loading alerts...</p>;
  if (error) return <p className="p-4">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Real-time Alerts</h1>
        <Link
          to="/"
          className="text-blue-600 hover:underline font-semibold"
        >
          ← Home
        </Link>
      </div>

      {alerts.length === 0 ? (
        <p className="text-gray-500">No alerts to display.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">
                Alert ID: {alert.id}
              </h2>
              <p>
                <strong>Priority:</strong> {alert.priority}
              </p>
              <p>
                <strong>Type:</strong> {alert.type}
              </p>
              <p>
                <strong>Status:</strong> {alert.status}
              </p>
              {alert.transactionId && (
                <p>
                  <strong>Transaction ID:</strong> {alert.transactionId}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Created: {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
