import React from "react";
import { updateApplicationStatus } from "../api/application";

export default function ApplicationsList({ applications, onStatusChange }) {
  const handleAction = async (appId, status) => {
    await updateApplicationStatus(appId, status);
    onStatusChange();
  };

  return (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No applications yet.</p>
      ) : (
        applications.map((app) => (
          <div
            key={app.appId}
            className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold text-lg text-gray-800">
                  {app.helperName}
                </p>
                <p className="text-gray-600 text-sm mt-1">{app.message}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  app.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : app.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </span>
            </div>
            {app.status === "pending" && (
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => handleAction(app.appId, "accepted")}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleAction(app.appId, "rejected")}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
