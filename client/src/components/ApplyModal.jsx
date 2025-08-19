import React, { useState } from "react";
import { applyToNeed } from "../api/application";
import { X, Send } from "lucide-react"; // Using icons for a cleaner look

// 1. Accept the new onApplySuccess prop
export default function ApplyModal({ needId, onClose, onApplySuccess }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // 2. Add state for handling API errors (like "Already applied")
  const [error, setError] = useState("");

  const isValid = message.trim().length > 0;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(""); // Reset error on a new attempt

    try {
      // 3. Call the API within a try...catch block
      await applyToNeed(needId, message);

      // 4. On success, call the new prop. This will close the modal
      // and refresh the data on the HomePage.
      onApplySuccess();
    } catch (err) {
      // 5. If the API returns an error, display it to the user.
      const errorMessage =
        err.response?.data?.error || "An unknown error occurred.";
      setError(errorMessage);
      setLoading(false); // Stop loading indicator on error
    }
  };

  return (
    // Main container with backdrop
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      {/* Modal panel with a subtle animation */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in-up">
        {/* Close button in the top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header section */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Send an Offer to Help
          </h2>
          <p className="text-gray-500 mt-1">
            Your message will be sent directly to the person who created the
            post.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleApply} className="space-y-4">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            rows={5}
            placeholder="Hi, I saw your post and I'd be happy to help with..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* Display API error message here */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || loading}
              className="flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  Send Offer
                  <Send className="ml-2" size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
