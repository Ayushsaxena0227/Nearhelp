import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { getApplicationsForOwner } from "../../api/application";
// Lazy load the heavy list component (code-splitting)
const ApplicationsList = React.lazy(() =>
  import("../../components/ApplicationList")
);

import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Memoized skeleton (not recreated every render)
const SkeletonCard = React.memo(function SkeletonCard() {
  return (
    <div className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
});

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // Load applications (stable callback + unmount guard)
  const load = useCallback(async () => {
    let cancelled = false;
    setLoading(true);
    try {
      const data = await getApplicationsForOwner();
      if (!cancelled) setApplications(data);
    } catch (error) {
      if (!cancelled) console.error("Error loading applications:", error);
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cleanup = load();
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [load]);

  const handleApplicationAccepted = useCallback(
    (matchId) => {
      if (matchId) navigate(`/chat/${matchId}`);
      else load();
    },
    [navigate, load]
  );

  // Memoized counts and filters (avoid O(n) each render)
  const statusCounts = useMemo(() => {
    return applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter((app) => app.status === filter);
  }, [applications, filter]);

  // Memoized UI configs (avoid recreating arrays on each render)
  const statsConfig = useMemo(
    () => [
      {
        label: "Total",
        value: applications.length,
        icon: MessageSquare,
        color: "from-blue-500 to-cyan-500",
        bg: "from-blue-50 to-cyan-50",
      },
      {
        label: "Pending",
        value: statusCounts.pending || 0,
        icon: Clock,
        color: "from-yellow-400 to-orange-400",
        bg: "from-yellow-50 to-orange-50",
      },
      {
        label: "Accepted",
        value: statusCounts.accepted || 0,
        icon: CheckCircle,
        color: "from-green-500 to-emerald-500",
        bg: "from-green-50 to-emerald-50",
      },
      {
        label: "Rejected",
        value: statusCounts.rejected || 0,
        icon: XCircle,
        color: "from-red-500 to-pink-500",
        bg: "from-red-50 to-pink-50",
      },
    ],
    [
      applications.length,
      statusCounts.pending,
      statusCounts.accepted,
      statusCounts.rejected,
    ]
  );

  const filterTabs = useMemo(
    () => [
      { key: "all", label: "All", count: applications.length },
      { key: "pending", label: "Pending", count: statusCounts.pending || 0 },
      { key: "accepted", label: "Accepted", count: statusCounts.accepted || 0 },
      { key: "rejected", label: "Rejected", count: statusCounts.rejected || 0 },
    ],
    [
      applications.length,
      statusCounts.pending,
      statusCounts.accepted,
      statusCounts.rejected,
    ]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* 🎨 Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* 🔹 Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/60 rounded-2xl transition text-slate-600 hover:text-slate-900 hover:scale-110"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Applications on My Posts
              </h1>
              <p className="text-slate-600 font-medium">
                Manage applications from people who want to help you
              </p>
            </div>
          </div>

          {!loading && applications.length > 0 && (
            <div className="flex items-center space-x-3 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg font-bold">
              <Users className="w-5 h-5" />
              <span>{applications.length} Total</span>
            </div>
          )}
        </div>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* 🔹 Stats Cards */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden animate-slideUp"
                  style={{ animationDelay: `${idx * 120}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.bg} rounded-2xl opacity-70`}
                  ></div>
                  <div className="absolute inset-0 bg-white/40 rounded-2xl"></div>
                  <div className="relative p-6 border border-white/40 rounded-2xl shadow backdrop-blur-md group-hover:scale-105 transition transform cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-slate-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  {/* Hover shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                </div>
              );
            })}
          </div>
        )}

        {/* 🔹 Filter Tabs */}
        {!loading && applications.length > 0 && (
          <div className="relative">
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/40 shadow-lg">
              <div className="flex items-center mb-4 space-x-2">
                <Filter className="w-5 h-5 text-slate-600" />
                <span className="font-bold text-slate-700">
                  Filter by status:
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 ${
                      filter === tab.key
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          filter === tab.key
                            ? "bg-white/30 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 🔹 Content */}
        {loading ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : applications.length === 0 ? (
          <div className="relative text-center py-20 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/40 rounded-3xl animate-slideUp">
            <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              No applications yet
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              When people apply to your posts, their applications will appear
              here.
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="relative text-center py-20 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/40 rounded-3xl animate-slideUp">
            <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              {filter === "pending" && (
                <Clock className="w-12 h-12 text-yellow-500" />
              )}
              {filter === "accepted" && (
                <CheckCircle className="w-12 h-12 text-green-500" />
              )}
              {filter === "rejected" && (
                <XCircle className="w-12 h-12 text-red-500" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              No {filter} applications
            </h3>
            <p className="text-slate-500">Try changing filters.</p>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="space-y-6">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            }
          >
            <ApplicationsList
              applications={filteredApplications}
              onStatusChange={load}
              onApplicationAccepted={handleApplicationAccepted}
            />
          </Suspense>
        )}
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
