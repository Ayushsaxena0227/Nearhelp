import React, { useState } from "react";
import { createNeed } from "../api/need";
import { useLocation } from "../hooks/useLocation";
import {
  X,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  Shield,
  Sparkles,
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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/60 via-purple-900/30 to-slate-900/60 backdrop-blur-xl flex justify-center items-center z-[60] p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-lg relative animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Decorative elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-15 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        >
          <X
            size={20}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
        </button>

        <div className="mb-8 text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4 animate-bounce">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Help Request
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Share what you need and let the community help you ✨
          </p>
        </div>

        {success ? (
          <div className="text-center py-12 animate-fadeIn">
            <div className="relative inline-block">
              <CheckCircle className="mx-auto text-emerald-500 h-20 w-20 animate-bounce" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
            </div>
            <h3 className="mt-6 text-2xl font-bold text-slate-800">
              Request Posted!
            </h3>
            <p className="mt-2 text-slate-500 font-medium">
              Your request is now live and visible to helpers 🚀
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-6 animate-fadeIn">
            <div className="group">
              <input
                className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/50 backdrop-blur-sm placeholder-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium group-hover:border-slate-300"
                placeholder="What do you need help with? ✋"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="group">
              <select
                className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/50 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 font-medium group-hover:border-slate-300"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Choose your category... 📂</option>
                <option value="transport">🚛 Transport / Moving</option>
                <option value="it_support">💻 IT Support</option>
                <option value="gardening">🌱 Gardening</option>
              </select>
            </div>

            <div className="group">
              <textarea
                className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/50 backdrop-blur-sm placeholder-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 font-medium resize-none group-hover:border-slate-300"
                rows={4}
                placeholder="Tell us more about what you need... 📝"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-100 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg">
              <label className="flex items-center space-x-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      isAnonymous
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500 shadow-lg"
                        : "border-slate-300 bg-white group-hover:border-slate-400"
                    }`}
                  >
                    {isAnonymous && (
                      <CheckCircle size={14} className="text-white" />
                    )}
                  </div>
                </div>
                <div className="flex items-center text-slate-700">
                  <Shield size={20} className="mr-3 text-blue-500" />
                  <span className="font-semibold">Post Anonymously</span>
                </div>
              </label>
              <p className="text-sm text-slate-500 mt-3 ml-10 font-medium">
                Your identity stays hidden until you choose to reveal it 🕶️
              </p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-100 rounded-2xl p-5 transition-all duration-300">
              {locationLoading && (
                <div className="flex items-center text-sm font-medium text-slate-600">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                  Finding your location... 📍
                </div>
              )}
              {locationError && (
                <div className="flex items-center text-sm text-red-600 font-medium">
                  <AlertTriangle size={18} className="mr-3 animate-bounce" />
                  {locationError}
                </div>
              )}
              {location && !locationError && (
                <div className="flex items-center text-sm text-emerald-700 font-medium">
                  <CheckCircle size={18} className="mr-3 animate-pulse" />
                  Perfect! Location ready to attach 🎯
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="flex items-center justify-center px-8 py-3.5 rounded-2xl text-white font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:scale-105 transform"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Creating Magic... ✨
                  </>
                ) : (
                  <>
                    Post Request 🚀
                    <PlusCircle className="ml-3" size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
