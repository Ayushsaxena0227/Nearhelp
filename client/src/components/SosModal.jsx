import React, { useState } from "react";
import { useLocation } from "../hooks/useLocation"; // 1. Import the location hook
import { createSOSAPI } from "../api/sos";
import { X, Siren, AlertTriangle, CheckCircle } from "lucide-react";

export default function SOSModal({ onClose, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 2. Use the location hook to get the user's coordinates
  const {
    location,
    error: locationError,
    loading: locationLoading,
  } = useLocation();

  // 3. Form is only valid if a location has been successfully found
  const isFormValid = title.trim() && description.trim() && location;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    try {
      // 4. Pass the latitude and longitude to the backend
      await createSOSAPI({
        title,
        description,
        latitude: location.lat,
        longitude: location.lng,
      });
      setSuccess(true);
      setTimeout(() => {
        onPostCreated();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error creating SOS:", err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <div className="mb-6 text-center">
          <Siren className="mx-auto text-red-500 h-12 w-12" />
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            Urgent SOS Alert
          </h2>
          <p className="text-gray-500 mt-1">
            This will send a notification to all nearby users.
          </p>
        </div>
        {success ? (
          <div className="text-center py-10">
            <CheckCircle className="mx-auto text-green-500 h-16 w-16" />
            <h3 className="mt-4 text-xl font-semibold">Alert Sent!</h3>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              className="w-full border p-3 rounded-lg"
              placeholder="What is the emergency? (e.g., Need car jump start)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full border p-3 rounded-lg"
              rows={2}
              placeholder="Add a brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* 5. Add a status indicator for the location */}
            <div className="p-3 rounded-lg border bg-gray-50">
              {locationLoading && (
                <p className="text-sm text-gray-500">
                  Getting your location...
                </p>
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
                disabled={!isFormValid || loading || locationLoading}
                className="flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-semibold bg-red-600 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Alert"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
