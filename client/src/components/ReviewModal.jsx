import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { submitReviewAPI } from "../api/review";
import { auth } from "../utils/firebase";
import { useAuth } from "../hooks/useAuth";

export default function ReviewModal({ match, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const rateeUid =
        auth.currentUser.uid === match.seekerUid
          ? match.helperUid
          : match.seekerUid;

      await submitReviewAPI({
        matchId: match.matchId,
        rateeUid,
        rating,
        comment,
        raterName: auth.currentUser.displayName,
      });

      onReviewSubmitted();
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError("Could not submit review. Please try again.");
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Leave a Review</h2>
          <p className="text-gray-500 mt-1">
            How was your experience with {match.otherUserName}?
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="flex justify-center items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={40}
                className={`cursor-pointer transition-colors ${
                  rating >= star
                    ? "text-yellow-400"
                    : "text-gray-300 hover:text-yellow-200"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            rows={4}
            placeholder="Add a comment (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
