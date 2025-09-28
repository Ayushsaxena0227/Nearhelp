import React from "react";
import { useState } from "react";
import { auth } from "../../../utils/firebase";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  ChevronDown,
  CheckCircle,
  Clock,
  FileText,
  LogOut,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  User,
  Users,
  Flag,
  MapPin,
  Navigation,
  Settings,
  XCircle,
  Siren,
  Sparkles,
  Heart,
  Zap,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

// Mock ReportModal component - replace with your actual implementation
const ReportModal = ({ item, itemType, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-bold mb-4">Report {itemType}</h3>
      <p className="text-gray-600 mb-4">
        Why are you reporting this {itemType}?
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">
          Cancel
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Report
        </button>
      </div>
    </div>
  </div>
);

const FeedCard = ({ item, type, appliedIds, onApplyClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const isNeed = type === "needs";
  const currentUser = auth.currentUser;
  const isOwnPost = currentUser?.uid === item.ownerUid;
  const isAnonymous = item.ownerUid === "anonymous";
  const isSOS = item.type === "sos";

  let timeAgo = "Just now";
  if (item.createdAt) {
    const date = item.createdAt.seconds
      ? new Date(item.createdAt.seconds * 1000)
      : new Date(item.createdAt);

    if (!isNaN(date)) {
      timeAgo = formatDistanceToNow(date, { addSuffix: true });
    }
  }

  return (
    <div className="group relative animate-fadeInUp">
      {/* Decorative background elements */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur"></div>

      <div
        className={`relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] p-6 ${
          isSOS
            ? "border-red-400 bg-gradient-to-br from-red-50 to-pink-50 animate-pulse shadow-red-200"
            : isNeed
            ? "border-blue-200/60 hover:border-blue-300"
            : "border-purple-200/60 hover:border-purple-300"
        }`}
      >
        {/* SOS Priority Badge */}
        {isSOS && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce flex items-center">
            <Siren size={12} className="mr-1" />
            URGENT
          </div>
        )}

        {/* Category Badge */}
        <div
          className={`absolute -top-2 -left-2 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
            isNeed
              ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
              : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
          }`}
        >
          {isNeed ? "🆘 Help Needed" : "✨ Skill Available"}
        </div>

        {/* Three-dot menu */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/60 rounded-full transition-all duration-300 backdrop-blur-sm group-hover:scale-110"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute top-10 right-0 bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl border border-white/40 w-44 z-20 overflow-hidden animate-slideDown">
                <button
                  onClick={() => {
                    setShowReportModal(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
                >
                  <Flag size={14} className="mr-3" /> Report post
                </button>
              </div>
            </>
          )}
        </div>

        {/* Header with User Info */}
        <div className="flex justify-between items-start mb-6 pt-4">
          {isAnonymous ? (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-700 text-lg">
                  {item.ownerName}
                </h4>
                <p className="text-sm text-slate-500 font-medium">
                  Anonymous User 🕶️
                </p>
              </div>
            </div>
          ) : (
            <Link
              to={`/profile/${item.ownerUid}`}
              className="flex items-center space-x-4 group/profile hover:scale-105 transition-transform duration-300"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  isNeed
                    ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                    : "bg-gradient-to-br from-purple-500 to-pink-600"
                }`}
              >
                <span className="text-white font-bold text-sm">
                  {item.ownerInitials}
                </span>
              </div>
              <div>
                <h4
                  className={`font-bold text-slate-800 text-lg group-hover/profile:${
                    isNeed ? "text-blue-600" : "text-purple-600"
                  } transition-colors duration-300`}
                >
                  {item.ownerName}
                </h4>
                <p className="text-sm text-slate-500 font-medium">
                  Community Helper ⭐
                </p>
              </div>
            </Link>
          )}
          <div className="text-right">
            <span className="inline-flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium">
              <Clock className="w-3 h-3 mr-1.5" />
              {timeAgo}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-3 leading-relaxed">
            {item.title} {isSOS && "🚨"}
          </h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            {item.description}
          </p>
        </div>

        {/* Location Display */}
        {item.distance !== undefined && (
          <div className="mb-6">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm ${
                isNeed
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-purple-50 text-purple-700 border border-purple-200"
              }`}
            >
              <MapPin size={16} className="mr-2" />
              <span>
                {item.distance < 1
                  ? "Less than 1 km away 📍"
                  : `${item.distance.toFixed(1)} km away 📍`}
              </span>
            </div>
          </div>
        )}

        {/* Action Section */}
        <div className="flex justify-end">
          {isOwnPost ? (
            <div className="inline-flex items-center text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
              <CheckCircle className="w-4 h-4 mr-2" />
              {isNeed ? "Your Request ✨" : "Your Skill ⚡"}
            </div>
          ) : isNeed ? (
            appliedIds.has(item.needId) ? (
              <div className="inline-flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                <CheckCircle className="w-4 h-4 mr-2" />
                Applied Successfully! 🎉
              </div>
            ) : (
              <button
                onClick={() => onApplyClick(item)}
                className="group/btn inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Heart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                Offer Help 🤝
              </button>
            )
          ) : (
            <button
              onClick={() => onApplyClick(item)}
              className="group/btn inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
              Request Help ✨
            </button>
          )}
        </div>

        {/* Hover glow effect */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none ${
            isNeed
              ? "bg-gradient-to-br from-blue-400 to-cyan-500"
              : "bg-gradient-to-br from-purple-400 to-pink-500"
          }`}
        ></div>
      </div>

      {showReportModal && (
        <ReportModal
          item={item}
          itemType={type === "needs" ? "post" : "skill"}
          onClose={() => setShowReportModal(false)}
        />
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default FeedCard;
