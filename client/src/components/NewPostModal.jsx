import React, { useState } from "react";
import { createNeed } from "../api/need";
import { useLocation } from "../hooks/useLocation";
import {
  X,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  Shield,
} from "lucide-react";

export default function NewPostModal({ onClose, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {
    location,
    error: locationError,
    loading: locationLoading,
  } = useLocation();

  const isFormValid = title.trim() && category.trim() && description.trim();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);

    try {
      // 👇 This now uses your clean API function
      await createNeed({
        title,
        category,
        description,
        isAnonymous,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      setSuccess(true);
      setTimeout(() => {
        onPostCreated();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
      setLoading(false);
    }
  };

  return (
    // 👇 Restored your original background style
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Create a New Help Request
          </h2>
          <p className="text-gray-500 mt-1">
            Clearly describe what you need help with.
          </p>
        </div>
        {success ? (
          <div className="text-center py-10">
            <CheckCircle className="mx-auto text-green-500 h-16 w-16" />
            <h3 className="mt-4 text-xl font-semibold">Post Created!</h3>
            <p className="mt-1 text-gray-500">Your request is now live.</p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              className="w-full border p-3 rounded-lg"
              placeholder="e.g., Need help moving a couch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className="w-full border p-3 rounded-lg bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category...</option>
              <option value="transport">Transport / Moving</option>
              <option value="it_support">IT Support</option>
              <option value="gardening">Gardening</option>
            </select>
            <textarea
              className="w-full border p-3 rounded-lg"
              rows={4}
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="border-t pt-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-5 w-5 rounded text-blue-600"
                />
                <div className="flex items-center text-gray-700">
                  <Shield size={18} className="mr-2" />
                  <span className="font-semibold">Post Anonymously</span>
                </div>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-8">
                Your name and profile will be hidden until you accept an offer.
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-gray-50">
              {locationLoading && (
                <p className="text-sm">Getting your location...</p>
              )}
              {locationError && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertTriangle size={16} className="mr-2" />
                  {locationError}
                </div>
              )}
              {location && !locationError && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle size={16} className="mr-2" />
                  Location will be attached
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-semibold bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Posting..." : "Create Post"}
                {!loading && <PlusCircle className="ml-2" size={18} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
