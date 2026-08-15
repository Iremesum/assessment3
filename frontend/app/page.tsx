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

type RequestData = {
  id: number;
  feedId: number | null;
  clientId: string | null;
  endpoint: string;
  statusCode: number;
  responseTimeMs: number;
  requestedAt: string;
};

export default function Home() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const [healthResponse, metricsResponse, requestsResponse] =
        await Promise.all([
          fetch(`${APIURL}/api/health`),
          fetch(`${APIURL}/api/count`),
          fetch(`${APIURL}/api/requests`),
        ]);

      if (
        !healthResponse.ok ||
        !metricsResponse.ok ||
        !requestsResponse.ok
      ) {
        throw new Error("Failed to load dashboard data");
      }

      const healthData = await healthResponse.json();
      const metricsData = await metricsResponse.json();
      const requestsData = await requestsResponse.json();

      setHealth(healthData);
      setMetrics(metricsData);
      setRequests(requestsData);
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
        <h2 className="text-2xl font-bold mb-2">
          RSS Server Dashboard
        </h2>

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
          <p className="text-sm text-gray-500 mb-2">
            Server Health
          </p>

          <p className="text-2xl font-bold">
            {health?.status === "ok"
              ? "Healthy"
              : "Unavailable"}
          </p>

          {health && (
            <p className="text-sm text-gray-500 mt-2">
              Database: {health.database}
            </p>
          )}
        </div>

        <div className="border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">
            Total Requests
          </p>

          <p className="text-2xl font-bold">
            {metrics?.totalRequests ?? 0}
          </p>
        </div>

        <div className="border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">
            Failed Requests
          </p>

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
        <p className="text-sm text-gray-500 mb-2">
          Unique Clients
        </p>

        <p className="text-2xl font-bold">
          {metrics?.uniqueClients ?? 0}
        </p>
      </div>

      <div className="mt-8 border rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="text-lg font-semibold">
            Recent Requests
          </h3>

          <p className="text-sm text-gray-500">
            Latest requests recorded by the RSS Server.
          </p>
        </div>

        {requests.length === 0 ? (
          <p className="p-5 text-gray-500">
            No requests recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="p-3">Endpoint</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Response Time</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="p-3">
                      {request.endpoint}
                    </td>

                    <td className="p-3">
                      {request.statusCode}
                    </td>

                    <td className="p-3">
                      {request.responseTimeMs} ms
                    </td>

                    <td className="p-3">
                      {new Date(
                        request.requestedAt
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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