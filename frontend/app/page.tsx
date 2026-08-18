"use client";

import { useEffect, useMemo, useState } from "react";
import AuthStatus from "./components/AuthStatus";

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

type PostData = {
  id: number;
  title: string;
  status?: string;
  author?: string;
  createdAt?: string;
};

type CountItem = {
  label: string;
  count: number;
};

export default function Home() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [
        healthResponse,
        metricsResponse,
        requestsResponse,
        postsResponse,
      ] = await Promise.all([
        fetch(`${APIURL}/api/health`),
        fetch(`${APIURL}/api/count`),
        fetch(`${APIURL}/api/requests`),
        fetch(`${APIURL}/api/feed`),
      ]);

      if (
        !healthResponse.ok ||
        !metricsResponse.ok ||
        !requestsResponse.ok ||
        !postsResponse.ok
      ) {
        throw new Error("Failed to load dashboard data");
      }

      const healthData = await healthResponse.json();
      const metricsData = await metricsResponse.json();
      const requestsData = await requestsResponse.json();
      const postsData = await postsResponse.json();

      setHealth(healthData);
      setMetrics(metricsData);
      setRequests(
        Array.isArray(requestsData) ? requestsData : []
      );
      setPosts(
        Array.isArray(postsData) ? postsData : []
      );

      setError("");
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const publishedPosts = posts.filter(
    (post) => post.status === "published"
  ).length;

  const draftPosts = posts.filter(
    (post) => post.status === "draft"
  ).length;

  const requestsByEndpoint = useMemo(
    () =>
      groupAndCount(
        requests.map((request) => request.endpoint || "Unknown")
      ),
    [requests]
  );

  const requestsByFeed = useMemo(
    () =>
      groupAndCount(
        requests.map((request) =>
          request.feedId !== null
            ? `Feed ${request.feedId}`
            : "No feed"
        )
      ),
    [requests]
  );

  const requestsByClient = useMemo(
    () =>
      groupAndCount(
        requests.map(
          (request) => request.clientId || "Anonymous"
        )
      ),
    [requests]
  );

  const alerts = useMemo(() => {
    const items: {
      title: string;
      message: string;
      level: "success" | "warning" | "error";
    }[] = [];

    if (health?.status === "ok" && health.database === "connected") {
      items.push({
        title: "System healthy",
        message:
          "The API is available and the database connection is healthy.",
        level: "success",
      });
    } else if (health) {
      items.push({
        title: "System health warning",
        message:
          "The API or database health check is reporting a problem.",
        level: "error",
      });
    }

    if ((metrics?.failedRequests ?? 0) > 0) {
      items.push({
        title: "Failed requests detected",
        message: `${metrics?.failedRequests} failed request(s) have been recorded.`,
        level: "warning",
      });
    }

    if ((metrics?.averageResponseTimeMs ?? 0) > 500) {
      items.push({
        title: "High response time",
        message:
          "Average response time is currently above 500 ms.",
        level: "warning",
      });
    }

    if ((metrics?.totalRequests ?? 0) === 0) {
      items.push({
        title: "No request activity",
        message:
          "No RSS server requests have been recorded yet.",
        level: "warning",
      });
    }

    return items;
  }, [health, metrics]);

  return (
    <div className="min-h-screen bg-[#F6F8FA] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-[#172033]">
              RSS Server Dashboard
            </h1>

            <p className="text-[#52606D]">
              Live operational information, RSS content summaries,
              alerts and request reporting.
            </p>
          </div>

          <AuthStatus />
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {loading && (
          <div className="mb-6 rounded-xl border border-[#D9E1E8] bg-white p-4 text-[#52606D] shadow-sm">
            Loading dashboard data...
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title="Server Health">
            <p
              className={`text-2xl font-bold ${
                health?.status === "ok"
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              {health?.status === "ok"
                ? "Healthy"
                : "Unavailable"}
            </p>

            {health && (
              <p className="mt-2 text-sm text-[#52606D]">
                Database: {health.database}
              </p>
            )}
          </DashboardCard>

          <DashboardCard title="Total Requests">
            <MetricValue
              value={metrics?.totalRequests ?? 0}
            />
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
            <MetricValue
              value={
                metrics
                  ? `${metrics.averageResponseTimeMs.toFixed(
                      1
                    )} ms`
                  : "0 ms"
              }
            />
          </DashboardCard>

          <DashboardCard title="Unique Clients">
            <MetricValue
              value={metrics?.uniqueClients ?? 0}
            />
          </DashboardCard>

          <DashboardCard title="Total Announcements">
            <MetricValue value={posts.length} />
          </DashboardCard>

          <DashboardCard title="Published Posts">
            <MetricValue value={publishedPosts} />
          </DashboardCard>

          <DashboardCard title="Draft Posts">
            <MetricValue value={draftPosts} />
          </DashboardCard>
        </section>

        <section className="mt-8">
          <SectionHeader
            title="System Alerts"
            description="Current health and operational conditions detected by the dashboard."
          />

          <div className="grid gap-3 md:grid-cols-2">
            {alerts.length === 0 ? (
              <AlertCard
                level="success"
                title="No active alerts"
                message="No operational problems are currently detected."
              />
            ) : (
              alerts.map((alert) => (
                <AlertCard
                  key={alert.title}
                  level={alert.level}
                  title={alert.title}
                  message={alert.message}
                />
              ))
            )}
          </div>
        </section>

        <section className="mt-8">
          <SectionHeader
            title="Request Reporting"
            description="Breakdown of recent RSS Server request activity."
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <ReportPanel
              title="Requests by Endpoint"
              data={requestsByEndpoint}
            />

            <ReportPanel
              title="Requests by Feed"
              data={requestsByFeed}
            />

            <ReportPanel
              title="Requests by Client"
              data={requestsByClient}
            />
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-[#D9E1E8] bg-white shadow-sm">
          <div className="border-b border-[#D9E1E8] p-5">
            <h2 className="text-xl font-semibold text-[#172033]">
              Recent Requests
            </h2>

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
                      Feed
                    </th>
                    <th className="p-3 text-sm font-semibold text-[#334155]">
                      Client
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
                      <td className="p-3 font-medium text-[#172033]">
                        {request.endpoint}
                      </td>

                      <td className="p-3 text-[#52606D]">
                        {request.feedId ?? "—"}
                      </td>

                      <td className="p-3 text-[#52606D]">
                        {request.clientId || "Anonymous"}
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
        </section>

        <button
          onClick={loadDashboard}
          className="mt-6 rounded-lg bg-[#1E3A5F] px-5 py-2.5 font-medium text-white transition hover:bg-[#172E4D]"
        >
          Refresh Dashboard
        </button>
      </div>
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

function MetricValue({
  value,
}: {
  value: string | number;
}) {
  return (
    <p className="text-2xl font-bold text-[#172033]">
      {value}
    </p>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-[#172033]">
        {title}
      </h2>

      <p className="mt-1 text-sm text-[#52606D]">
        {description}
      </p>
    </div>
  );
}

function AlertCard({
  title,
  message,
  level,
}: {
  title: string;
  message: string;
  level: "success" | "warning" | "error";
}) {
  const styles = {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning:
      "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${styles[level]}`}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}

function ReportPanel({
  title,
  data,
}: {
  title: string;
  data: CountItem[];
}) {
  const maxCount = Math.max(
    ...data.map((item) => item.count),
    1
  );

  return (
    <div className="rounded-xl border border-[#D9E1E8] bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-[#172033]">
        {title}
      </h3>

      {data.length === 0 ? (
        <p className="text-sm text-[#52606D]">
          No data available yet.
        </p>
      ) : (
        <div className="space-y-4">
          {data.slice(0, 5).map((item) => {
            const width = Math.max(
              (item.count / maxCount) * 100,
              8
            );

            return (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-[#334155]">
                    {item.label}
                  </span>

                  <span className="font-semibold text-[#172033]">
                    {item.count}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#E5EDF3]">
                  <div
                    className="h-full rounded-full bg-[#0891B2]"
                    style={{
                      width: `${width}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function groupAndCount(values: string[]): CountItem[] {
  const counts = values.reduce<Record<string, number>>(
    (result, value) => {
      result[value] = (result[value] ?? 0) + 1;
      return result;
    },
    {}
  );

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}