import React, { useState } from "react";
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
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchTerm, setSearchTerm] = useState("");

  const samplePosts = [
    {
      id: 1,
      user: { name: "Mike Chen", rating: 4.9, distance: "0.3 miles" },
      type: "need",
      category: "repair",
      title: "Need help fixing my bike chain",
      description:
        "My bike chain came off and I can't seem to get it back on properly. Would appreciate some help!",
      time: "2 hours ago",
      replies: 3,
    },
    {
      id: 2,
      user: { name: "Emma Rodriguez", rating: 4.8, distance: "0.5 miles" },
      type: "offer",
      category: "tutoring",
      title: "Spanish tutoring available",
      description:
        "Native Spanish speaker offering conversation practice and tutoring for kids and adults.",
      time: "4 hours ago",
      replies: 7,
    },
    {
      id: 3,
      user: { name: "David Park", rating: 5.0, distance: "0.8 miles" },
      type: "need",
      category: "errands",
      title: "Grocery pickup for elderly neighbor",
      description:
        "Looking for someone to help pick up groceries for my elderly neighbor who has mobility issues.",
      time: "6 hours ago",
      replies: 2,
    },
  ];

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

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">SJ</span>
                </div>
                <button
                  onClick={() => auth.signOut()}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span className="text-sm font-medium">
                    {auth.currentUser?.displayName || "User"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
