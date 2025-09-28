import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  ArrowLeft,
  Briefcase,
  Sparkles,
  User,
  MessageCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getUserProfileAPI } from "../../api/users";

// Enhanced Ratings Component
const StarRating = ({ rating, count }) => (
  <div className="flex items-center space-x-2">
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-current"
              : i < rating
              ? "text-yellow-400 fill-current opacity-50"
              : "text-slate-300"
          }`}
        />
      ))}
    </div>
    <span className="font-bold text-slate-800 text-lg">
      {rating.toFixed(1)}
    </span>
    <span className="text-slate-500 font-medium">({count} reviews)</span>
  </div>
);

export default function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfileAPI(userId);
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl opacity-30 animate-ping"></div>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            User Not Found
          </h2>
          <p className="text-slate-600 mb-6 font-medium">
            This profile doesn't exist or has been removed.
          </p>
          <Link
            to="/home"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Home
          </Link>
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

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link
            to="/home"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8 font-semibold transition-colors duration-300 group"
          >
            <ArrowLeft
              size={20}
              className="mr-2 group-hover:-translate-x-1 transition-transform duration-300"
            />
            Back to Home
          </Link>

          {/* Profile Header Card */}
          <div className="relative mb-8 animate-slideUp">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl shadow-2xl">
                    {profile.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {profile.name}
                  </h1>
                  <div className="mb-4">
                    <StarRating
                      rating={profile.ratingAvg}
                      count={profile.ratingCount}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl border border-blue-200 font-semibold text-sm">
                      Community Helper
                    </div>
                    <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-2xl border border-purple-200 font-semibold text-sm">
                      {profile.skills?.length || 0} Skills
                    </div>
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 font-semibold text-sm">
                      {profile.ratingCount} Reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Skills Section */}
            <div className="lg:col-span-2">
              <div
                className="relative mb-2 animate-slideUp"
                style={{ animationDelay: "200ms" }}
              >
                <h2 className="text-3xl font-bold flex items-center text-slate-800 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl mr-4 shadow-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  Skills Offered
                </h2>

                {profile.skills?.length > 0 ? (
                  <div className="grid gap-6">
                    {profile.skills.map((skill, index) => (
                      <div
                        key={skill.skillId}
                        className="group relative overflow-hidden animate-slideUp"
                        style={{ animationDelay: `${300 + index * 100}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                        <div className="relative p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-white/40 transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02]">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="font-bold text-xl text-slate-800 group-hover:text-purple-600 transition-colors duration-300">
                              {skill.title}
                            </h3>
                            <div className="p-2 bg-gradient-to-r from-purple-400 to-blue-500 rounded-xl">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <p className="text-slate-600 leading-relaxed font-medium">
                            {skill.description}
                          </p>
                          {/* Hover glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center rounded-2xl bg-white/80 backdrop-blur-xl text-slate-500 border border-white/40 shadow-lg">
                    <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">
                      No Skills Listed
                    </h3>
                    <p className="font-medium">
                      This user hasn't added any skills yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="lg:col-span-1">
              <div
                className="relative animate-slideUp"
                style={{ animationDelay: "400ms" }}
              >
                <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl mr-4 shadow-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  Reviews
                </h2>

                {profile.reviews?.length === 0 ? (
                  <div className="p-8 bg-white/80 backdrop-blur-xl text-center text-slate-500 rounded-2xl border border-white/40 shadow-lg">
                    <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="font-medium">
                      Be the first to leave a review!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.reviews.map((review, index) => (
                      <div
                        key={review.reviewId}
                        className="group relative overflow-hidden animate-slideUp"
                        style={{ animationDelay: `${500 + index * 100}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                        <div className="relative p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                          <div className="flex items-start justify-between mb-4">
                            <StarRating rating={review.rating} count={0} />
                            {review.createdAt?.seconds && (
                              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                                {formatDistanceToNow(
                                  new Date(review.createdAt.seconds * 1000),
                                  { addSuffix: true }
                                )}
                              </span>
                            )}
                          </div>
                          {review.comment && (
                            <blockquote className="text-slate-700 italic leading-relaxed font-medium">
                              "{review.comment}"
                            </blockquote>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
