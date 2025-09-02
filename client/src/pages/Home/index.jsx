import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { auth } from "../../utils/firebase";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";

// API Imports
import { getNeedsAPI } from "../../api/need";
import { getSkillsAPI } from "../../api/skill";
import {
  getApplicationsForOwner,
  getApplicationsByHelper,
} from "../../api/application";
import { getMatchesForUser } from "../../api/matches";

// Component Imports
import NewPostModal from "../../components/NewPostModal";
import NewSkillModal from "../../components/SkillModal";
import ApplyModal from "../../components/ApplyModal";
import ReportModal from "../../components/ReportModal"; // Make sure this is importe

// Icon Imports
import {
  Users,
  Search,
  Bell,
  Plus,
  LogOut,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  ChevronDown,
  User,
  MoreVertical,
  Flag,
} from "lucide-react";

import Nearhelp_logo from "../../assets/Nearhelp_logo/help.png";
import {
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

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

const FeedCard = ({ item, type, appliedIds, onApplyClick }) => {
  // 👇 1. ADD STATE for the report menu and modal
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isNeed = type === "needs";
  const currentUser = auth.currentUser;
  const isOwnPost = currentUser?.uid === item.ownerUid;
  const isAnonymous = item.ownerUid === "anonymous";

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
      className={`relative bg-white rounded-xl shadow-sm p-6 hover:shadow-md  transition-shadow ${
        !isNeed && "border-purple-100"
      }`}
    >
      {!isOwnPost && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0"
                onClick={() => setMenuOpen(false)}
              />
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
      )}

      <div className="flex justify-between items-start mb-4">
        {/* This block is now conditional based on whether the post is anonymous */}
        {item.isAnonymous ? (
          // --- UI for ANONYMOUS posts (Not a link) ---
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-300">
              <span className="text-gray-600 font-bold text-lg">?</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">{item.ownerName}</h4>
            </div>
          </div>
        ) : (
          // --- UI for REGULAR posts (Is a link) ---
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
                className={`font-medium text-gray-900 transition-colors ${
                  isNeed
                    ? "group-hover:text-blue-600"
                    : "group-hover:text-purple-600"
                }`}
              >
                {item.ownerName}
              </h4>
            </div>
          </Link>
        )}
        <span className="text-xs text-gray-500 flex items-center shrink-0">
          <Clock className="w-3 h-3 mr-1" />
          {timeAgo}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
      <p className="text-gray-700 mb-4">{item.description}</p>
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

      {/* 👇 4. RENDER the ReportModal when its state is true */}
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

// --- The rest of your HomePage component is completely unchanged ---
export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);
  const [view, setView] = useState("needs");
  const [appCount, setAppCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [appliedNeedIds, setAppliedNeedIds] = useState(new Set());
  const [showNeedModal, setShowNeedModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allMatches, setAllMatches] = useState([]);

  const loadFeeds = async () => {
    setLoadingFeeds(true);
    try {
      const [needsData, skillsData] = await Promise.all([
        getNeedsAPI(),
        getSkillsAPI(),
      ]);
      setPosts(needsData);
      setSkills(skillsData);
    } catch (error) {
      console.error("Error loading feeds:", error);
    }
    setLoadingFeeds(false);
  };

  useEffect(() => {
    loadFeeds();
    if (!user) return;

    const fetchData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const [profileData, appsData, matchesData, sentAppsData] =
          await Promise.all([
            axios.get("http://localhost:5007/users/me", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            getApplicationsForOwner(),
            getMatchesForUser(),
            getApplicationsByHelper(),
          ]);
        setProfile(profileData.data);
        // setAppCount(appsData.filter((a) => a.status === "pending").length);
        setMatchCount(matchesData.length);
        setAppliedNeedIds(new Set(sentAppsData.map((app) => app.needId)));
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/login";
  };

  const handleApplySuccess = () => {
    setActiveItem(null);
    if (user) {
      getApplicationsByHelper().then((myApps) =>
        setAppliedNeedIds(new Set(myApps.map((app) => app.needId)))
      );
    }
  };
  useEffect(() => {
    if (!user) {
      setAppCount(0); // Clear count if user logs ou
      return;
    }
    const db = getFirestore();

    const q = query(
      collection(db, "applications"),
      where("seekerUid", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const pendingCount = querySnapshot.size;
      console.log(
        `Real-time update: You have ${pendingCount} pending applications.`
      );
      setAppCount(pendingCount);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const loadMatchData = async () => {
      if (user) {
        const matches = await getMatchesForUser();
        setAllMatches(matches);
      }
    };
    loadMatchData();
    const iv = setInterval(loadMatchData, 30000);
    return () => clearInterval(iv);
  }, [user]);

  const ActiveMatchCount = allMatches.filter(
    (match) => match.status != "completed"
  ).length;
  // console.log(ActiveMatchCount);

  if (authLoading) return null;
  if (!user) return <p>Please login to continue.</p>;

  const displayName = profile?.name || user.displayName || user.email;
  const initials =
    displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r  rounded-lg flex items-center justify-center">
                <img
                  src={Nearhelp_logo}
                  className="w-5 h-5"
                  alt="nearhelp icon"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">NearHelp</span>
            </Link>
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border-gray-400 shadow-xl border rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSkillModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl flex items-center space-x-2 text-sm font-semibold"
              >
                <Plus size={16} />
                <span className="hidden sm:inline cursor-pointer">
                  Offer Skill
                </span>
              </button>
              <button
                onClick={() => setShowNeedModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center space-x-2 text-sm font-semibold"
              >
                <Plus size={16} />
                <span className="hidden sm:inline cursor-pointer">
                  Post a Need
                </span>
              </button>
              <Link
                to="/my-applications"
                className="relative p-2 hover:bg-gray-100 rounded-full"
              >
                <Bell size={20} />
                {appCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {appCount}
                  </span>
                )}
              </Link>
              <div className="relative">
                <div
                  className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "profile" ? null : "profile"
                    )
                  }
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {initials}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      openDropdown === "profile" ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {openDropdown === "profile" && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute top-12 right-0 bg-white rounded-xl shadow-lg border w-64 z-20 animate-fade-in-down">
                      <div className="p-4 border-b">
                        <p className="font-semibold text-gray-800 truncate">
                          {displayName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          to={`/profile/${user.uid}`}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User size={16} className="mr-3 text-gray-500" /> View
                          Profile
                        </Link>
                        <Link
                          to="/my-applications"
                          className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <FileText
                              size={16}
                              className="mr-3 text-gray-500"
                            />{" "}
                            My Applications
                          </div>
                          {appCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                              {appCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/matches"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <MessageSquare
                            size={16}
                            className="mr-3 text-gray-500"
                          />{" "}
                          Messages
                        </Link>
                      </div>
                      <div className="border-t p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <LogOut size={16} className="mr-3" /> Logout
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <p className="text-2xl font-bold">{ActiveMatchCount}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-purple-100 text-sm">Offered Skills</p>
                <p className="text-2xl font-bold">{skills.length}</p>
              </div>
              <Users className="w-10 h-10 text-purple-200" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {view === "needs" ? "Community Requests" : "Offered Skills"}
            </h2>
            <div className="flex items-center bg-gray-200 p-1 rounded-full">
              <button
                onClick={() => setView("needs")}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                  view === "needs"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600"
                }`}
              >
                Needs
              </button>
              <button
                onClick={() => setView("skills")}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                  view === "skills"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600"
                }`}
              >
                Skills
              </button>
            </div>
          </div>
          {loadingFeeds ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : view === "needs" ? (
            posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <FileText className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold">
                  No requests posted yet
                </h3>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <FeedCard
                    key={post.needId}
                    item={post}
                    type="needs"
                    appliedIds={appliedNeedIds}
                    onApplyClick={setActiveItem}
                  />
                ))}
              </div>
            )
          ) : skills.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <Users className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold">No skills offered yet</h3>
            </div>
          ) : (
            <div className="space-y-6">
              {skills.map((skill) => (
                <FeedCard
                  key={skill.skillId}
                  item={skill}
                  type="skills"
                  appliedIds={new Set()}
                  onApplyClick={setActiveItem}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      {showNeedModal && (
        <NewPostModal
          onClose={() => setShowNeedModal(false)}
          onPostCreated={loadFeeds}
        />
      )}
      {showSkillModal && (
        <NewSkillModal
          onClose={() => setShowSkillModal(false)}
          onSkillCreated={loadFeeds}
        />
      )}
      {activeItem && (
        <ApplyModal
          needId={activeItem.needId || activeItem.skillId}
          onClose={() => setActiveItem(null)}
          onApplySuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
