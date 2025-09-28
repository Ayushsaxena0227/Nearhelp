import React, { useEffect, useState } from "react";
import { getMatchesForUser } from "../../api/matches";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Users,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  CheckCircle,
  Search,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const Navigate = useNavigate();
  const activematchcount = matches.filter(
    (m) => m.status !== "completed"
  ).length;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMatchesForUser();
      const sortedData = data.sort((a, b) => {
        const timeA = a.createdAt?._seconds || 0;
        const timeB = b.createdAt?._seconds || 0;
        return timeB - timeA;
      });
      setMatches(sortedData);
    } catch (error) {
      console.error("Error loading matches:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const NavigateBack = () => Navigate(-1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl opacity-30 animate-ping"></div>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">
            Loading conversations...
          </p>
        </div>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative z-10 text-center bg-white/90 backdrop-blur-xl border border-white/40 p-12 rounded-3xl shadow-2xl max-w-md">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            No Conversations Yet
          </h2>
          <p className="text-slate-600 mb-8 font-medium leading-relaxed">
            Start connecting with your community! Apply to help someone or
            accept help to begin meaningful conversations.
          </p>

          <div className="space-y-4">
            <Link
              to="/home"
              className="inline-flex items-center px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full justify-center"
            >
              <Search className="w-5 h-5 mr-3" />
              Find Help Requests
            </Link>

            <button
              onClick={NavigateBack}
              className="inline-flex items-center px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold border-2 border-slate-200 hover:border-slate-300 shadow-md hover:shadow-lg transition-all duration-300 w-full justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Enhanced Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={NavigateBack}
              className="p-2 hover:bg-white/60 rounded-2xl transition-all duration-300 text-slate-600 hover:text-slate-900 hover:scale-110"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Conversations
              </h1>
              <p className="text-slate-600 font-medium">
                {activematchcount} active conversation
                {activematchcount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
            <Heart className="w-4 h-4" />
            <span className="font-semibold text-sm">Stay Connected</span>
          </div>
        </div>
      </div>

      {/* Enhanced Matches Grid */}
      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <div className="grid gap-6">
          {matches.map((match, index) => {
            const matchDate = match.createdAt?._seconds
              ? new Date(match.createdAt._seconds * 1000)
              : new Date();
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
                className="block group animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden">
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                  <div className="relative p-6 bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2 group-hover:scale-[1.02]">
                    <div className="flex items-center space-x-6">
                      {/* Enhanced Avatar */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-xl">
                          {initials}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-xl flex items-center justify-center border-2 border-white">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors duration-300 truncate">
                            {match.otherName}
                          </h3>
                          <div className="flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-semibold">
                            <Clock className="w-3 h-3 mr-1.5" />
                            {formatDistanceToNow(matchDate, {
                              addSuffix: true,
                            })}
                          </div>
                        </div>

                        {match.needTitle && (
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-slate-600 truncate bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 inline-block">
                              About: {match.needTitle}
                            </p>
                          </div>
                        )}

                        {match.lastMessage && (
                          <blockquote className="text-slate-600 truncate italic font-medium mb-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                            "{match.lastMessage}"
                          </blockquote>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-sm text-slate-600 font-semibold capitalize">
                              {match.status || "active"}
                            </span>
                          </div>

                          <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                            <span className="text-sm font-semibold mr-2">
                              Open Chat
                            </span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Message */}
        <div className="text-center mt-10 p-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-lg">
          <div className="flex items-center justify-center space-x-2 text-slate-600">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">
              New messages will appear here automatically
            </span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
