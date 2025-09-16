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
} from "lucide-react";
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
    <div
      className={`relative bg-white rounded-xl shadow-sm p-6 ... ${
        isSOS && "border-2 border-red-500 animate-pulse"
      }`}
    >
      {/* Three-dot menu - only show for posts that aren't the user's own */}

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
        >
          <MoreVertical size={18} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
            <div className="absolute top-8 right-0 bg-white shadow-lg rounded-lg border w-40 z-20">
              <button
                onClick={() => {
                  setShowReportModal(true);
                  setMenuOpen(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Flag size={14} className="mr-2" /> Report post
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-start mb-4">
        {isAnonymous ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-300">
              <span className="text-gray-600 font-bold text-lg">?</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">{item.ownerName}</h4>
            </div>
          </div>
        ) : (
          <Link
            to={`/profile/${item.ownerUid}`}
            className="flex items-center space-x-3 group relative"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isNeed
                  ? "bg-gradient-to-r from-blue-500 to-green-500"
                  : "bg-gradient-to-r from-purple-500 to-pink-500"
              }`}
            >
              <span className="text-white font-medium text-sm">
                {item.ownerInitials}
              </span>
            </div>
            <div>
              <h4
                className={`font-medium text-gray-900 group-hover:${
                  isNeed ? "text-blue-600" : "text-purple-600"
                }`}
              >
                {item.ownerName}
              </h4>
            </div>
          </Link>
        )}
        <span className="text-xs text-gray-500 flex items-center shrink-0 pr-8">
          <Clock className="w-3 h-3 mr-1" />
          {timeAgo}
        </span>
      </div>

      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
      <p className="text-gray-700 mb-4">{item.description}</p>

      {/* Location display - if it exists */}
      {item.distance !== undefined && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center text-sm font-semibold text-gray-600">
            <MapPin size={14} className="mr-1.5" />
            <span>
              {item.distance < 1
                ? "Less than 1 km"
                : `${item.distance.toFixed(1)} km`}{" "}
              away
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-4">
        {isOwnPost ? (
          <span className="inline-flex items-center text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
            {isNeed ? "Your Post" : "Your Skill"}
          </span>
        ) : isNeed ? (
          appliedIds.has(item.needId) ? (
            <span className="inline-flex items-center text-sm font-medium text-blue-600">
              <CheckCircle className="w-4 h-4 mr-1.5" /> Applied
            </span>
          ) : (
            <button
              onClick={() => onApplyClick(item)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> Offer Help
            </button>
          )
        ) : (
          <button
            onClick={() => onApplyClick(item)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center"
          >
            <MessageSquare className="w-4 h-4 mr-2" /> Request Help
          </button>
        )}
      </div>

      {showReportModal && (
        <ReportModal
          item={item}
          itemType={type === "needs" ? "post" : "skill"}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export default FeedCard;
