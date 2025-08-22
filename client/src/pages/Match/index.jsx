import React, { useEffect, useState } from "react";
import { getMatchesForUser } from "../../api/matches";
import { Link } from "react-router-dom";
import { MessageSquare, Users, Clock, ArrowRight, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMatchesForUser();
      setMatches(data);
    } catch (error) {
      console.error("Error loading matches:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Skeleton loader
  const MatchSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <MatchSkeleton />
            <MatchSkeleton />
            <MatchSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            No conversations yet
          </h2>
          <p className="text-gray-600 mb-6">
            When you apply to help someone or someone applies to help you, your
            conversations will appear here.
          </p>
          <Link
            to="/home"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:opacity-90 transition"
          >
            <Users className="w-5 h-5 mr-2" />
            Find Help Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Your Conversations
              </h1>
              <p className="text-gray-600 mt-1">
                {matches.length} active conversation
                {matches.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MessageSquare className="w-4 h-4" />
              <span>Stay connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          {matches.map((match) => {
            // Handle different date formats from Firebase
            const matchDate = match.createdAt?._seconds
              ? new Date(match.createdAt._seconds * 1000)
              : match.createdAt
              ? new Date(match.createdAt)
              : new Date();

            // Generate initials from otherName
            const initials = match.otherName
              ? match.otherName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "?";

            return (
              <Link
                key={match.matchId}
                to={`/chat/${match.matchId}`}
                className="block group"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 group-hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {initials}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {match.otherName}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 ml-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(matchDate, { addSuffix: true })}
                        </div>
                      </div>

                      {/* Need title if available */}
                      {match.needTitle && (
                        <p className="text-sm text-gray-600 mb-2 truncate">
                          About: {match.needTitle}
                        </p>
                      )}

                      {/* Last message preview if available */}
                      {match.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {match.lastMessage}
                        </p>
                      )}

                      {/* Status indicator */}
                      <div className="flex items-center mt-2">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            match.status === "active"
                              ? "bg-green-400"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span className="text-xs text-gray-500 capitalize">
                          {match.status || "active"}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💬 New messages will appear here automatically</p>
        </div>
      </div>
    </div>
  );
}
