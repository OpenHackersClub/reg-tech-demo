"use client";

import React, { useEffect, useState } from 'react';

interface Alert {
  id: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  status: 'open' | 'in_progress' | 'closed';
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
        const response = await fetch('http://localhost:3000/alerts'); // Assuming API runs on port 3000
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
    const interval = setInterval(fetchAlerts, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading alerts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Real-time Alerts</h1>
      {alerts.length === 0 ? (
        <p>No alerts to display.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Alert ID: {alert.id}</h2>
              <p><strong>Priority:</strong> {alert.priority}</p>
              <p><strong>Type:</strong> {alert.type}</p>
              <p><strong>Status:</strong> {alert.status}</p>
              {alert.transactionId && <p><strong>Transaction ID:</strong> {alert.transactionId}</p>}
              <p className="text-sm text-gray-500">Created: {new Date(alert.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
