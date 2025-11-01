import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RegTech Demo - AML Compliance Platform" },
    {
      name: "description",
      content: "Transaction monitoring and document management platform for AML compliance",
    },
  ];
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            RegTech Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            AML Compliance & Transaction Monitoring Platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Document Management Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              📄 Document Management
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Upload and manage client documents with automated analysis and compliance checks.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/documents"
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                View Documents
              </Link>
              <Link
                to="/tooljet"
                className="flex items-center justify-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Upload Document
              </Link>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              🚨 Alerts & Monitoring
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Real-time transaction monitoring and compliance alerts for suspicious activities.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/alerts"
                className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                View Alerts
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by Confluent Cloud, Apache Flink, and React Router</p>
        </div>
      </main>
    </div>
  );
}
