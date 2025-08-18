import React, { useEffect, useState } from "react";
import { getApplicationsForOwner } from "../../api/application";
import ApplicationsList from "../../components/ApplicationList";
import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, accepted, rejected

  const load = async () => {
    setLoading(true);
    try {
      const data = await getApplicationsForOwner();
      console.log("Applications data:", data);
      setApplications(data);
    } catch (error) {
      console.error("Error loading applications:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Filter applications based on selected filter
  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  // Count applications by status
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="flex space-x-2 mt-4">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const getFilterIcon = (filterType) => {
    switch (filterType) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">
                Applications on My Posts
              </h1>
              <p className="text-gray-600 mt-1">
                Manage applications from people who want to help you
              </p>
            </div>

            {!loading && applications.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{applications.length} total applications</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.length}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusCounts.pending || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusCounts.accepted || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusCounts.rejected || 0}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && applications.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                {
                  key: "all",
                  label: "All Applications",
                  count: applications.length,
                },
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
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {getFilterIcon(tab.key)}
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        filter === tab.key
                          ? "bg-blue-200 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No applications yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              When people apply to help with your posts, their applications will
              appear here. Make sure your posts are clear and engaging to
              attract helpers!
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {getFilterIcon(filter)}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No {filter !== "all" ? filter : ""} applications
            </h3>
            <p className="text-gray-600">
              {filter === "pending" && "No pending applications at the moment."}
              {filter === "accepted" && "No accepted applications yet."}
              {filter === "rejected" && "No rejected applications."}
            </p>
          </div>
        ) : (
          <ApplicationsList
            applications={filteredApplications}
            onStatusChange={load}
          />
        )}
      </div>
    </div>
  );
}
