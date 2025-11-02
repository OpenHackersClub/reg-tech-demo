import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Compliance Dashboard - RegTech Demo" },
    {
      name: "description",
      content: "AML compliance officer dashboard for transaction monitoring and risk assessment",
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

interface ClientDocument {
  id: string;
  clientId: string;
  fileName: string;
  filePath: string;
  analysisResults: {
    riskScore?: number;
    riskLevel?: "low" | "medium" | "high" | "critical";
    findings?: string[];
    suggestedMitigations?: string[];
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsRes, docsRes] = await Promise.all([
          fetch("http://localhost:3000/alerts"),
          fetch("http://localhost:3000/documents"),
        ]);

        if (!alertsRes.ok || !docsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const alertsData: Alert[] = await alertsRes.json();
        const docsData: ClientDocument[] = await docsRes.json();

        setAlerts(alertsData);
        setDocuments(docsData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Calculate statistics
  const stats = {
    totalAlerts: alerts.length,
    highPriorityAlerts: alerts.filter((a) => a.priority === "high").length,
    openAlerts: alerts.filter((a) => a.status === "open").length,
    totalDocuments: documents.length,
    highRiskClients: documents.filter(
      (d) => d.analysisResults?.riskLevel === "high" || d.analysisResults?.riskLevel === "critical"
    ).length,
  };

  // Get recent alerts (last 5)
  const recentAlerts = alerts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Get high-risk client assessments
  const riskAssessments = documents
    .filter((d) => d.analysisResults && d.analysisResults.riskLevel)
    .sort((a, b) => {
      const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aRisk = riskOrder[a.analysisResults?.riskLevel || "low"];
      const bRisk = riskOrder[b.analysisResults?.riskLevel || "low"];
      return bRisk - aRisk;
    })
    .slice(0, 5);

  // Collect all suggested mitigations
  const allMitigations = documents
    .flatMap((d) => d.analysisResults?.suggestedMitigations || [])
    .filter((m, i, arr) => arr.indexOf(m) === i); // Unique mitigations

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-200";
      default:
        return "text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const riskLevelColor = (level?: string) => {
    switch (level) {
      case "critical":
        return "text-red-900 bg-red-200 dark:bg-red-900 dark:text-red-100";
      case "high":
        return "text-red-700 bg-red-100 dark:bg-red-800 dark:text-red-200";
      case "medium":
        return "text-yellow-700 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-200";
      case "low":
        return "text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-200";
      default:
        return "text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900 p-6 rounded-lg">
          <p className="text-red-700 dark:text-red-200">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Compliance Officer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            AML monitoring, risk assessment, and compliance overview
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Alerts
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalAlerts}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              High Priority
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.highPriorityAlerts}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Open Alerts
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.openAlerts}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Documents
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalDocuments}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              High Risk Clients
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.highRiskClients}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Alerts Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Alerts
              </h2>
              <Link
                to="/alerts"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="p-6">
              {recentAlerts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No alerts to display
                </p>
              ) : (
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white mb-1">
                            {alert.type}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {alert.id.substring(0, 8)}...
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${priorityColor(
                            alert.priority
                          )}`}
                        >
                          {alert.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Status: {alert.status}
                        </span>
                        <span className="text-gray-500 dark:text-gray-500">
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {alert.transactionId && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Transaction: {alert.transactionId.substring(0, 12)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Client Risk Assessments Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Client Risk Assessments
              </h2>
              <Link
                to="/documents"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="p-6">
              {riskAssessments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No risk assessments available
                </p>
              ) : (
                <div className="space-y-4">
                  {riskAssessments.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white mb-1">
                            Client: {doc.clientId}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {doc.fileName}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${riskLevelColor(
                            doc.analysisResults?.riskLevel
                          )}`}
                        >
                          {doc.analysisResults?.riskLevel?.toUpperCase() || "PENDING"}
                        </span>
                      </div>
                      {doc.analysisResults?.riskScore !== undefined && (
                        <div className="mb-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Risk Score: {doc.analysisResults.riskScore}/100
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full"
                              style={{ width: `${doc.analysisResults.riskScore}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {doc.analysisResults?.findings && doc.analysisResults.findings.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {doc.analysisResults.findings.length} finding(s) identified
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggested Mitigations Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Suggested Mitigations
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Recommended actions based on current risk assessments
            </p>
          </div>
          <div className="p-6">
            {allMitigations.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No mitigation suggestions available
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allMitigations.map((mitigation, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">{mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/alerts"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-center"
          >
            Manage Alerts
          </Link>
          <Link
            to="/documents"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-center"
          >
            Review Documents
          </Link>
          <Link
            to="/tooljet"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-center"
          >
            Upload New Document
          </Link>
        </div>
      </div>
    </div>
  );
}
