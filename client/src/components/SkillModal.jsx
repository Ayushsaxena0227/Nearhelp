import React, { useState } from "react";
import { createSkillAPI } from "../api/skill";
import { X, PlusCircle, CheckCircle } from "lucide-react";

export default function NewSkillModal({ onClose, onSkillCreated }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 👇 FIX: Removed 'location' from the validation
  const isFormValid = title.trim() && category.trim() && description.trim();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    try {
      // 👇 FIX: Removed 'location' from the data sent to the API
      await createSkillAPI({ title, category, description });
      setSuccess(true);
      setTimeout(() => {
        onSkillCreated();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error creating skill:", err);
      setLoading(false);
    }
  };

  return (
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
            Offer a New Skill
          </h2>
          <p className="text-gray-500 mt-1">
            Share what you can do to help your community.
          </p>
        </div>
        {success ? (
          <div className="text-center py-10">
            <CheckCircle className="mx-auto text-green-500 h-16 w-16" />
            <h3 className="mt-4 text-xl font-semibold">Skill Posted!</h3>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              className="w-full border p-3 rounded-lg"
              placeholder="e.g., Dog Walking"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className="w-full border p-3 rounded-lg bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category...</option>
              <option value="pet_care">Pet Care</option>
              <option value="tutoring">Tutoring & Education</option>
              <option value="it_support">IT Support / Tech Help</option>
            </select>
            <textarea
              className="w-full border p-3 rounded-lg"
              rows={4}
              placeholder="Describe your skill and availability..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
                {loading ? "Posting..." : "Offer Skill"}
                {!loading && <PlusCircle className="ml-2" size={18} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
