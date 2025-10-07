import React, { useState } from "react";
import { applyToNeed } from "../api/application";
import { X, Send } from "lucide-react";

export default function ApplyModal({ needId, onClose, onApplySuccess }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!needId) return null; // 🚫 Prevent empty modal blur bug

  const isValid = message.trim().length > 0;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError("");

    try {
      await applyToNeed(needId, message);
      onApplySuccess(); // refresh feed
      onClose(); // ✅ close modal, remove blur
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "An unknown error occurred.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-md p-4">
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-8 animate-fade-in-up border border-white/40">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800">
            Send an Offer to Help
          </h2>
          <p className="text-slate-500">
            Your message will go directly to the requester.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleApply} className="space-y-4">
          <textarea
            placeholder="Hi, I’d be happy to help with..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white/70 backdrop-blur-sm shadow-sm transition"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || loading}
              className="flex items-center px-6 py-2.5 rounded-xl text-white font-semibold shadow-lg bg-gradient-to-r from-blue-500 to-green-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  Send Offer <Send size={18} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
