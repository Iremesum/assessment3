"use client";

import { useEffect, useState } from "react";

const APIURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type HealthData = {
  status: string;
  database: string;
  responseTimeMs: number;
};

type MetricsData = {
  totalRequests: number;
  failedRequests: number;
  uniqueClients: number;
  averageResponseTimeMs: number;
};

export default function Home() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const [healthResponse, metricsResponse] = await Promise.all([
        fetch(`${APIURL}/api/health`),
        fetch(`${APIURL}/api/count`),
      ]);

      if (!healthResponse.ok || !metricsResponse.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const healthData = await healthResponse.json();
      const metricsData = await metricsResponse.json();

      setHealth(healthData);
      setMetrics(metricsData);
      setError("");
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Could not connect to the backend.");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">RSS Server Dashboard</h2>
        <p className="text-gray-500">
          Live operational information from the RSS Server.
        </p>
      </div>

      {error && (
        <p className="text-red-600 mb-6">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Server Health</p>

          <p className="text-2xl font-bold">
            {health?.status === "ok" ? "Healthy" : "Unavailable"}
          </p>

          {health && (
            <p className="text-sm text-gray-500 mt-2">
              Database: {health.database}
            </p>
          )}
        </div>

        <div className="border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Total Requests</p>

          <p className="text-2xl font-bold">
            {metrics?.totalRequests ?? 0}
          </p>
        </div>

        <div className="border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Failed Requests</p>

          <p className="text-2xl font-bold">
            {metrics?.failedRequests ?? 0}
          </p>
        </div>

        <div className="border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">
            Average Response Time
          </p>

          <p className="text-2xl font-bold">
            {metrics
              ? `${metrics.averageResponseTimeMs.toFixed(1)} ms`
              : "0 ms"}
          </p>
        </div>
      </div>

      <div className="mt-6 border rounded-lg p-5 shadow-sm">
        <p className="text-sm text-gray-500 mb-2">Unique Clients</p>

        <p className="text-2xl font-bold">
          {metrics?.uniqueClients ?? 0}
        </p>
      </div>

      <button
        onClick={loadDashboard}
        className="mt-6 px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-700 transition-colors"
      >
        Refresh Dashboard
      </button>
    </div>
  );
}