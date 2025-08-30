import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  ArrowLeft,
  Briefcase,
  Dog,
  BookOpen,
  HardDrive,
  Truck,
  Leaf,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getUserProfileAPI } from "../../api/users";

// A small component for rendering star ratings
const StarRating = ({ rating, count }) => (
  <div className="flex items-center space-x-1">
    <Star className="w-5 h-5 text-yellow-400 fill-current" />
    <span className="font-bold text-gray-800">{rating.toFixed(1)}</span>
    <span className="text-gray-500">({count} reviews)</span>
  </div>
);

// NEW: Helper component to get an icon based on the skill category
const SkillIcon = ({ category }) => {
  let IconComponent;
  switch (category) {
    case "pet_care":
      IconComponent = Dog;
      break;
    case "tutoring":
      IconComponent = BookOpen;
      break;

    case "it_support":
      IconComponent = HardDrive;
      break;
    case "transport":
      IconComponent = Truck;
      break;
    case "gardening":
      IconComponent = Leaf;
      break;
    default:
      IconComponent = Sparkles;
  }
  return (
    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
      <IconComponent size={24} />
    </div>
  );
};

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
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <Link
          to="/home"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <Link
          to="/home"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>
        <div className="bg-white p-8 rounded-2xl shadow-sm flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            <div className="mt-2">
              <StarRating
                rating={profile.ratingAvg}
                count={profile.ratingCount}
              />
            </div>
          </div>
        </div>

        {/* UPDATED: Skills Offered Section with New UI */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Briefcase size={24} className="mr-3 text-purple-600" />
            Skills Offered
          </h2>
          {profile.skills && profile.skills.length > 0 ? (
            <div className="space-y-4">
              {profile.skills.map((skill) => (
                <div
                  key={skill.skillId}
                  className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-5"
                >
                  <SkillIcon category={skill.category} />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">
                      {skill.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {skill.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
              <p>This user has not listed any skills yet.</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Reviews Received
          </h2>
          {profile.reviews.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
              <p>This user has no reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.reviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <StarRating rating={review.rating} count={0} />
                    {review.createdAt?.seconds && (
                      <span className="text-sm text-gray-400">
                        {formatDistanceToNow(
                          new Date(review.createdAt.seconds * 1000),
                          { addSuffix: true }
                        )}
                      </span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="mt-4 text-gray-700 italic">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
