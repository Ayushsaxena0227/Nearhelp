import React, { useState } from "react";
import { createNeed } from "../api/need";
import { useLocation } from "../hooks/useLocation"; // 1. Import the location hook
import { X, PlusCircle, CheckCircle, AlertTriangle } from "lucide-react";

export default function NewPostModal({ onClose, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 2. Use the location hook to get location, error, and loading status
  const {
    location,
    error: locationError,
    loading: locationLoading,
  } = useLocation();

  // 3. Update form validation to include the location
  const isFormValid =
    title.trim() && category.trim() && description.trim() && location;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);

    try {
      // 4. Pass the location data when creating the need
      await createNeed({ title, category, description, location });
      setSuccess(true);
      setTimeout(() => {
        onPostCreated();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error creating post:", err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Create a New Help Request
          </h2>
          <p className="text-gray-500 mt-1">
            Clearly describe what you need help with to get the best responses.
          </p>
        </div>

        {success ? (
          <div className="text-center py-10">
            <CheckCircle className="mx-auto text-green-500 h-16 w-16" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              Post Created!
            </h3>
            <p className="text-gray-500 mt-1">
              Your request is now live for the community.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              placeholder="e.g., Need help moving a couch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category...</option>
              <option value="transport">Transport / Moving</option>
              <option value="it_support">IT Support / Tech Help</option>
              <option value="gardening">Gardening & Landscaping</option>
              {/* Add your other options here */}
            </select>

            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-shadow"
              rows={4}
              placeholder="Add more details: urgency, specific skills needed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* 5. Location Status Indicator */}
            <div className="p-3 rounded-lg border bg-gray-50">
              {locationLoading && (
                <p className="text-sm text-gray-500">
                  Getting your location...
                </p>
              )}
              {locationError && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                  {locationError}
                </div>
              )}
              {location && !locationError && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                  Location captured successfully!
                </div>
              )}
            </div>

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
                // 6. Disable button if form is invalid or while loading location/submitting
                disabled={!isFormValid || loading || locationLoading}
                className="flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
