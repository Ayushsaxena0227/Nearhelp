import React, { useEffect, useState } from "react";
import { getApplicationsForOwner } from "../../api/application";
import ApplicationsList from "../../components/ApplicationList";
import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getApplicationsForOwner();
      setApplications(data);
    } catch (error) {
      console.error("Error loading applications:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleApplicationAccepted = (matchId) => {
    if (matchId) navigate(`/chat/${matchId}`);
    else load();
  };

  // Filtering logic
  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  // Status counts
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  // Skeleton shimmer card
  const SkeletonCard = () => (
    <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/3"></div>
          <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/2"></div>
          <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-full"></div>
        </div>
      </div>
    </div>
  );

  // Return UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-1 flex items-center text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>
            <h1 className="text-2xl font-bold text-slate-800">
              Applications on My Posts
            </h1>
            <p className="text-slate-500 text-sm">
              Manage applications from people who want to help you
            </p>
          </div>
          {!loading && applications.length > 0 && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl shadow">
              <Users className="w-4 h-4" />
              <span>{applications.length} total</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats overview cards */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Total",
                value: applications.length,
                icon: MessageSquare,
                color: "from-blue-500 to-cyan-500",
              },
              {
                label: "Pending",
                value: statusCounts.pending || 0,
                icon: Clock,
                color: "from-yellow-400 to-orange-400",
              },
              {
                label: "Accepted",
                value: statusCounts.accepted || 0,
                icon: CheckCircle,
                color: "from-green-500 to-emerald-500",
              },
              {
                label: "Rejected",
                value: statusCounts.rejected || 0,
                icon: XCircle,
                color: "from-red-500 to-pink-500",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-5 bg-white/70 backdrop-blur-md rounded-2xl shadow hover:shadow-xl transition border border-white/40 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <stat.icon
                  className={`w-10 h-10 text-white p-2 rounded-xl bg-gradient-to-r ${stat.color}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && applications.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All", count: applications.length },
              {
                key: "pending",
                label: "Pending",
                count: statusCounts.pending || 0,
              },
              {
                key: "accepted",
                label: "Accepted",
                count: statusCounts.accepted || 0,
              },
              {
                key: "rejected",
                label: "Rejected",
                count: statusCounts.rejected || 0,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`relative px-5 py-2 text-sm font-bold rounded-xl transition-all duration-500 ${
                  filter === tab.key
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow"
                    : "bg-white/70 text-slate-600 border border-white/30 hover:bg-white hover:text-slate-900"
                }`}
              >
                {tab.label}{" "}
                {tab.count > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-200">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Applications list */}
        {loading ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-md rounded-2xl shadow border border-white/40">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center mb-6">
              <MessageSquare className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No applications yet
            </h3>
            <p className="text-slate-500">
              When people apply to help, their applications will appear here.
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-md rounded-2xl shadow border border-white/40">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center mb-6">
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
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No {filter} applications
            </h3>
          </div>
        ) : (
          <ApplicationsList
            applications={filteredApplications}
            onStatusChange={load}
            onApplicationAccepted={handleApplicationAccepted}
          />
        )}
      </div>
    </div>
  );
}
