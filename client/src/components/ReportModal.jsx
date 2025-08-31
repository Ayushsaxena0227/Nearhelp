import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { submitReportAPI } from "../api/report";

export default function ReportModal({ item, itemType, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const reportReasons = [
    "Spam or Scam",
    "Inappropriate Content",
    "Harassment or Hate Speech",
    "Safety Concern",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason for the report.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await submitReportAPI({
        targetId: item.needId || item.skillId || item.uid,
        targetType: itemType,
        reason,
        details,
      });
      setSuccess(true);
      setTimeout(onClose, 2000); // Close modal after 2s on success
    } catch (err) {
      setError("Failed to submit report. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {success ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-gray-800">
              Report Submitted
            </h2>
            <p className="text-gray-500 mt-2">
              Thank you. Our team will review this shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Report Content
              </h2>
              <p className="text-gray-500 mt-1">
                Please select a reason for your report.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                {reportReasons.map((r) => (
                  <label
                    key={r}
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {r}
                    </span>
                  </label>
                ))}
              </div>
              <textarea
                className="w-full border p-3 rounded-lg"
                rows={3}
                placeholder="Provide additional details (optional)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !reason}
                className="w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                <AlertTriangle size={16} className="mr-2" />
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
