import React, { useState } from "react";
import { createNeed } from "../api/need";

export default function NewPostModal({ onClose, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if all fields have a value
  const isFormValid = title.trim() && category.trim() && description.trim();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      await createNeed({ title, category, description });

      // Show success message
      setSuccess(true);

      // Delay closing so user sees success
      setTimeout(() => {
        setSuccess(false);
        onPostCreated(); // Refresh posts list in parent
        onClose(); // Close modal
      }, 1500);
    } catch (err) {
      console.error("Error creating post:", err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/20 backdrop-blur-sm">
      {/* Modal Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 animate-[fadeInUp_0.3s_ease-out_forwards]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            className="border w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="border w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            <option value="repair">Repair Help</option>
            <option value="tutoring">Tutoring</option>
            <option value="errands">Errands</option>
          </select>

          <textarea
            className="border w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            rows={4}
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          {/* Success message */}
          {success && (
            <p className="text-green-600 font-medium text-sm">
              ✅ Post created successfully!
            </p>
          )}

          {/* Footer actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`px-4 py-2 rounded-lg text-white transition ${
                isFormValid
                  ? "bg-gradient-to-r from-blue-600 to-green-600 hover:opacity-90"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
