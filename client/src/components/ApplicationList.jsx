// src/components/ApplicationList.js

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { updateApplicationStatus } from "../api/application";
import { Clock, Check, X, MessageSquare, ArrowRight } from "lucide-react";

// Helper for status badge styling
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default function ApplicationsList({
  applications,
  onStatusChange,
  onApplicationAccepted,
}) {
  const [loadingState, setLoadingState] = useState({}); // Track loading state per card

  const handleUpdate = async (appId, status) => {
    setLoadingState((prev) => ({ ...prev, [appId]: true }));
    try {
      const response = await updateApplicationStatus(appId, status);
      if (status === "accepted") {
        // Use the new handler to navigate
        onApplicationAccepted(response.matchId);
      } else {
        // For rejections, just refresh the list
        onStatusChange();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      // Optionally show an error to the user
    }
    // No need to set loading to false, as the page will navigate or refresh
  };

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div
          key={app.appId}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium">
                {app.helperName.slice(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {app.helperName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Applied for: {app.needTitle}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {/* Message */}
              <div className="mt-3 bg-gray-50 p-3 rounded-lg border">
                <p className="text-sm text-gray-700 italic">"{app.message}"</p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-end space-x-3">
                {app.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleUpdate(app.appId, "rejected")}
                      disabled={loadingState[app.appId]}
                      className="flex items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <X size={16} className="mr-1.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleUpdate(app.appId, "accepted")}
                      disabled={loadingState[app.appId]}
                      className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-green-500 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <Check size={16} className="mr-1.5" />
                      {loadingState[app.appId]
                        ? "Accepting..."
                        : "Accept & Chat"}
                    </button>
                  </>
                )}
                {app.status === "accepted" && (
                  <Link
                    to={`/chat/${app.matchId}`} // Assumes matchId is on the app object
                    className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-green-500 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <MessageSquare size={16} className="mr-1.5" /> Open Chat
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
