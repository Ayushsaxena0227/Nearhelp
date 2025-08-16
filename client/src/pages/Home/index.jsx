import React, { useState, useEffect } from "react";
import { auth } from "../../utils/firebase";
import {
  Users,
  Search,
  Bell,
  Settings,
  ChevronDown,
  Plus,
  LogOut,
} from "lucide-react";
import { getNeeds } from "../../api/need"; // this uses axios now
import { formatDistanceToNow } from "date-fns";
import NewPostModal from "../../components/NewPostModal";
import ApplyModal from "../../components/ApplyModal"; // new modal for applying
import axios from "axios";
import { Link } from "react-router-dom";
import { getApplicationsForOwner } from "../../api/application";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeNeed, setActiveNeed] = useState(null);

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

  // Load posts with loader
  const loadPosts = async () => {
    setLoadingPosts(true);
    const data = await getNeeds();
    setPosts(data);
    setLoadingPosts(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Name & initials
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

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/login";
  };
  const [appCount, setAppCount] = useState(0);

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

  // Skeleton Post Loader
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
      <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">NeighborHub</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help, skills, or neighbors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl"
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-4 relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>

              {/* New Post Button */}
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:opacity-90 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </button>

              {/* Profile Dropdown */}
              <div
                className="flex items-center space-x-2 cursor-pointer"
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
                    <span className="text-sm font-medium">{displayName}</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </div>

              {dropdownOpen && (
                <div className="absolute top-12 right-0 bg-white rounded-md shadow-lg w-48">
                  <Link
                    to="/my-applications"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    My Applications
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 w-full text-left hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingPosts ? (
          <div className="space-y-6">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            📭 No posts yet. Create one to get started!
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.needId}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {post.ownerInitials}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{post.ownerName}</h4>
                    <span className="text-xs text-gray-500">
                      {post.createdAt
                        ? formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })
                        : "Just now"}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.description}</p>

                {/* Offer Help Button if post is not owned by logged-in user */}
                {auth.currentUser?.uid !== post.ownerUid && (
                  <button
                    onClick={() => setActiveNeed(post.needId)}
                    className="px-3 cursor-pointer py-1 text-sm bg-gradient-to-r from-blue-600 to-green-600 text-white rounded"
                  >
                    Offer Help
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <NewPostModal
          onClose={() => setShowModal(false)}
          onPostCreated={loadPosts}
        />
      )}
      {activeNeed && (
        <ApplyModal needId={activeNeed} onClose={() => setActiveNeed(null)} />
      )}
    </div>
  );
}
