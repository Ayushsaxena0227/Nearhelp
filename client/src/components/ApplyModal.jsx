import React, { useState } from "react";
import { applyToNeed } from "../api/application";

export default function ApplyModal({ needId, onClose }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isValid = message.trim().length > 0;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);

    const res = await applyToNeed(needId, message);
    console.log(res);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Offer Help</h2>
        <form onSubmit={handleApply} className="space-y-4">
          <textarea
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            rows={4}
            placeholder="Write a short message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || loading}
              className={`px-4 py-2 rounded-lg text-white ${
                isValid
                  ? "bg-gradient-to-r from-blue-600 to-green-600"
                  : "bg-gray-400"
              }`}
            >
              {loading ? "Sending..." : "Send Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
