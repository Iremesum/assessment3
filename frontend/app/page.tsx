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

      setHealth(await healthResponse.json());
      setMetrics(await metricsResponse.json());
      setRequests(await requestsResponse.json());
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
    <div className="min-h-screen bg-[#F6F8FA] p-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold text-[#172033]">
          RSS Server Dashboard
        </h2>

        <p className="text-[#52606D]">
          Live operational information from the RSS Server.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Server Health">
          <p
            className={`text-2xl font-bold ${
              health?.status === "ok"
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            {health?.status === "ok" ? "Healthy" : "Unavailable"}
          </p>

          {health && (
            <p className="mt-2 text-sm text-[#52606D]">
              Database: {health.database}
            </p>
          )}
        </DashboardCard>

        <DashboardCard title="Total Requests">
          <p className="text-2xl font-bold text-[#172033]">
            {metrics?.totalRequests ?? 0}
          </p>
        </DashboardCard>

        <DashboardCard title="Failed Requests">
          <p
            className={`text-2xl font-bold ${
              (metrics?.failedRequests ?? 0) > 0
                ? "text-red-700"
                : "text-[#172033]"
            }`}
          >
            {metrics?.failedRequests ?? 0}
          </p>
        </DashboardCard>

        <DashboardCard title="Average Response Time">
          <p className="text-2xl font-bold text-[#172033]">
            {metrics
              ? `${metrics.averageResponseTimeMs.toFixed(1)} ms`
              : "0 ms"}
          </p>
        </DashboardCard>
      </div>

      <div className="mt-6 rounded-xl border border-[#D9E1E8] bg-white p-5 shadow-sm">
        <p className="mb-2 text-sm font-medium text-[#52606D]">
          Unique Clients
        </p>

        <p className="text-2xl font-bold text-[#172033]">
          {metrics?.uniqueClients ?? 0}
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-[#D9E1E8] bg-white shadow-sm">
        <div className="border-b border-[#D9E1E8] p-5">
          <h3 className="text-lg font-semibold text-[#172033]">
            Recent Requests
          </h3>

          <p className="mt-1 text-sm text-[#52606D]">
            Latest requests recorded by the RSS Server.
          </p>
        </div>

        {requests.length === 0 ? (
          <p className="p-5 text-[#52606D]">
            No requests recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#EEF3F7]">
                <tr>
                  <th className="p-3 text-sm font-semibold text-[#334155]">
                    Endpoint
                  </th>
                  <th className="p-3 text-sm font-semibold text-[#334155]">
                    Status
                  </th>
                  <th className="p-3 text-sm font-semibold text-[#334155]">
                    Response Time
                  </th>
                  <th className="p-3 text-sm font-semibold text-[#334155]">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t border-[#E6EBF0] hover:bg-[#F7FAFC]"
                  >
                    <td className="p-3 text-[#172033]">
                      {request.endpoint}
                    </td>

                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-sm font-medium ${
                          request.statusCode >= 400
                            ? "bg-red-100 text-red-700"
                            : "bg-cyan-100 text-cyan-800"
                        }`}
                      >
                        {request.statusCode}
                      </span>
                    </td>

                    <td className="p-3 text-[#52606D]">
                      {request.responseTimeMs} ms
                    </td>

                    <td className="p-3 text-[#52606D]">
                      {new Date(request.requestedAt).toLocaleString()}
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
        className="mt-6 rounded-lg bg-[#1E3A5F] px-4 py-2 font-medium text-white transition hover:bg-[#172E4D]"
      >
        Refresh Dashboard
      </button>
    </div>
  );
}

function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#D9E1E8] bg-white p-5 shadow-sm transition hover:border-[#0891B2] hover:shadow-md">
      <p className="mb-2 text-sm font-medium text-[#52606D]">
        {title}
      </p>

      {children}
    </div>
  );
}