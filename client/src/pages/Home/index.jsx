import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getNearbyNeedsAPI, getNeeds } from "../../api/need";
import {
  getApplicationsForOwner,
  applyToNeed,
  getApplicationsByHelper,
} from "../../api/application";
import {
  Users,
  Search,
  Bell,
  Settings,
  Plus,
  LogOut,
  MessageSquare,
  Home,
  FileText,
  User,
  Menu,
  X,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  MapPin,
} from "lucide-react";
import NewPostModal from "../../components/NewPostModal";
import ApplyModal from "../../components/ApplyModal";
import { auth } from "../../utils/firebase";
import { formatDistanceToNow } from "date-fns";
import { getMatchesForUser } from "../../api/matches";
import axios from "axios";
import { Link } from "react-router-dom";
import { useLocation } from "../../hooks/useLocation";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();

  // Keep your exact state names
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeNeed, setActiveNeed] = useState(null);
  const [appCount, setAppCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [appliedNeedIds, setAppliedNeedIds] = useState(new Set());
  const {
    location,
    error: locationError,
    loading: locationLoading,
  } = useLocation();

  // 1) Fetch user profile from backend - your exact implementation
  useEffect(() => {
    const fetchProfile = async () => {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get("http://localhost:5007/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setLoadingProfile(false);
    };
    fetchProfile();
  }, []);

  const fetchMyApplications = async () => {
    if (!user) return;
    const mySentApplications = await getApplicationsByHelper();
    // console.log(mySentApplications);
    const ids = new Set(mySentApplications.map((app) => app.needId));
    setAppliedNeedIds(ids);
  };
  useEffect(() => {
    fetchMyApplications();
  }, [user]);
  const handleApplySuccess = () => {
    setActiveNeed(null); // Close the modal
    fetchMyApplications(); // Re-fetch your applications to update the UI
  };

  // 2) Load posts with loader - your exact implementation
  const loadPosts = async () => {
    if (!location) return; // Wait until we have a location

    setLoadingPosts(true);
    try {
      const data = await getNearbyNeedsAPI(location);
      setPosts(data);
    } catch (error) {
      console.error("Error loading nearby posts:", error);
    }
    setLoadingPosts(false);
  };

  // This useEffect now depends on the location being available
  useEffect(() => {
    loadPosts();
  }, [location]);

  // 3) Your exact application count logic
  useEffect(() => {
    const loadCount = async () => {
      const apps = await getApplicationsForOwner();
      setAppCount(apps.filter((a) => a.status === "pending").length);
    };
    loadCount();
    // Optional: poll every 30s or use real-time listener
    const iv = setInterval(loadCount, 30000);
    return () => clearInterval(iv);
  }, []);

  // Your exact name & initials logic
  let displayName =
    profile?.name || auth.currentUser?.displayName || auth.currentUser?.email;
  let initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  useEffect(() => {
    const loadMatchCount = async () => {
      if (user) {
        const matches = await getMatchesForUser();
        setMatchCount(matches.length);
      }
    };
    loadMatchCount();
    // Optional: You can also poll this every 30 seconds if you want it to be real-time
    const iv = setInterval(loadMatchCount, 30000);
    return () => clearInterval(iv);
  }, [user]);

  // Your exact logout handler
  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/login";
  };

  // Enhanced Skeleton Post Loader
  const PostSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
        <div>
          <div className="h-3 w-24 bg-gray-200 rounded mb-1"></div>
          <div className="h-2 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
      <div className="h-3 w-full bg-gray-200 rounded mb-1"></div>
      <div className="h-3 w-5/6 bg-gray-200 rounded mb-4"></div>
      <div className="flex justify-end">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  // Auth guard
  if (authLoading) return null;
  if (!user) return <p>Please login to continue.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NearHelp</span>
            </div>

            {/* Enhanced Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help, skills, or neighbors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Right section with enhanced styling */}
            <div className="flex items-center space-x-4 relative">
              {/* Enhanced notification bell */}
              <Link
                to="/my-applications"
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {appCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-tight">
                    {appCount}
                  </span>
                )}
              </Link>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>

              {/* Enhanced New Post Button */}
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:opacity-90 flex items-center space-x-2 transition-opacity shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Post</span>
              </button>

              {/* Enhanced Profile Dropdown */}
              <div className="relative">
                <div
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {loadingProfile ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {initials}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden md:inline">
                        {displayName}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </>
                  )}
                </div>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute top-12 right-0 bg-white rounded-xl shadow-lg border border-gray-200 w-48 z-20">
                      <div className="py-2">
                        <Link
                          to="/my-applications"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-3" />
                          My Applications
                        </Link>
                        <Link
                          to="/matches"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 mr-3" />
                          Messages
                          {appCount > 0 && (
                            <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                              {appCount}
                            </span>
                          )}
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 text-sm">Active Requests</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-100 text-sm">Active Chats</p>
                <p className="text-2xl font-bold">{matchCount}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-purple-100 text-sm">People Helped</p>
                <p className="text-2xl font-bold">{}</p>
              </div>
              <Users className="w-10 h-10 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Enhanced Feed Section */}
        {/* Enhanced Feed Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Community Requests
            </h2>
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
              {posts.length} active
            </span>
          </div>

          {locationLoading && (
            <p className="text-center text-gray-500 py-10">
              Getting your location to find nearby requests...
            </p>
          )}
          {locationError && (
            <p className="text-center text-red-500 py-10">{locationError}</p>
          )}

          {!locationLoading &&
            !locationError &&
            (loadingPosts ? (
              <div className="space-y-6">
                <PostSkeleton />
                <PostSkeleton />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No requests found nearby
                </h3>
                <p className="text-gray-600 mb-6">
                  There are no active help requests in your immediate area right
                  now. Try expanding your search radius or check back later.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div
                    key={post.needId}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Link
                        to={`/profile/${post.ownerUid}`}
                        className="flex items-center space-x-3 group relative"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {post.ownerInitials}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {post.ownerName}
                          </h4>
                        </div>
                        <div className="absolute -bottom-6 left-0 w-full flex justify-center opacity-0 group-hover:opacity-100 group-hover:-bottom-7 transition-all duration-300 pointer-events-none">
                          <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md">
                            View Profile
                          </span>
                        </div>
                      </Link>
                      {/* <span className="text-xs text-gray-500 flex items-center flex-shrink-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.createdAt
                          ? formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                            })
                          : "Just now"}
                      </span> */}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {post.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm font-semibold text-gray-600">
                        <MapPin size={14} className="mr-1.5" />
                        {post.distance.toFixed(1)} km away
                      </div>
                      <div className="flex justify-end">
                        {auth.currentUser?.uid !== post.ownerUid ? (
                          appliedNeedIds.has(post.needId) ? (
                            <span className="inline-flex items-center text-sm font-medium text-blue-600">
                              <CheckCircle className="w-4 h-4 mr-1.5" /> Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => setActiveNeed(post.needId)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:opacity-90 flex items-center space-x-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Offer Help</span>
                            </button>
                          )
                        ) : (
                          <span className="inline-flex items-center text-sm text-gray-500">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />{" "}
                            Your Post
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </main>

      {/* Your exact modals */}
      {showModal && (
        <NewPostModal
          onClose={() => setShowModal(false)}
          onPostCreated={loadPosts}
        />
      )}
      {activeNeed && (
        <ApplyModal
          needId={activeNeed}
          onClose={() => setActiveNeed(null)}
          onApplySuccess={handleApplySuccess} // Pass the success handler here
        />
      )}
    </div>
  );
}
