import React, { useState, useEffect } from "react";
import { auth } from "../../utils/firebase";
import {
  Users,
  Search,
  Bell,
  Settings,
  ChevronDown,
  Star,
  Plus,
  MessageCircle,
  MapPin,
  User,
  Filter,
  Heart,
  LogOut,
} from "lucide-react";
import { getNeeds, createNeed } from "../../api/need";

// Simple modal component for creating a post
function NewPostModal({ onClose, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createNeed({ title, category, description });
      onPostCreated();
      onClose();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">New Post</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            className="border w-full px-3 py-2 rounded"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select
            className="border w-full px-3 py-2 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select category</option>
            <option value="repair">Repair Help</option>
            <option value="tutoring">Tutoring</option>
            <option value="errands">Errands</option>
          </select>
          <textarea
            className="border w-full px-3 py-2 rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch("http://localhost:5007/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    if (auth.currentUser) {
      fetchProfile();
    }
  }, []);

  // Fetch posts
  const loadPosts = async () => {
    const data = await getNeeds();
    setPosts(data);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Name & initials logic
  let displayName =
    profile?.name ||
    auth.currentUser?.displayName ||
    auth.currentUser?.email ||
    "User";
  let initials = "";
  if (profile?.name) {
    const parts = profile.name.trim().split(" ");
    initials =
      parts.length >= 2
        ? parts[0][0] + parts[parts.length - 1][0]
        : parts[0][0];
  } else if (auth.currentUser?.displayName) {
    const parts = auth.currentUser.displayName.split(" ");
    initials = parts
      .map((n) => n[0])
      .join("")
      .slice(0, 2);
  } else if (auth.currentUser?.email) {
    initials = auth.currentUser.email.slice(0, 2).toUpperCase();
  }

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">
                NeighborHub
              </span>
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
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-4 relative">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              {/* Profile */}
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() =>
                  !loadingProfile && setDropdownOpen(!dropdownOpen)
                }
              >
                {loadingProfile ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {initials.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{displayName}</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </div>

              {dropdownOpen && (
                <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-md shadow-lg w-40">
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-100"
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{initials}</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{displayName}</h3>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium py-2.5 rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </button>
            </div>
          </div>

          {/* Feed */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post.needId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {post.ownerInitials || "??"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {post.ownerName}
                        </h4>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium capitalize">
                          {post.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{post.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <NewPostModal
          onClose={() => setShowModal(false)}
          onPostCreated={loadPosts}
        />
      )}
    </div>
  );
}
