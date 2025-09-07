import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../utils/firebase";
import { useAuth } from "../../hooks/useAuth";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Nearhelp_logo from "../../assets/Nearhelp_logo/help.png";
import { getNeedsAPI } from "../../api/need";
import { getMatchesForUser } from "../../api/matches";
import { getApplicationsByHelper } from "../../api/application";
import { getNearbyNeedsAPI } from "../../api/need";

import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import axios from "axios";
import NewPostModal from "../../components/NewPostModal";
import NewSkillModal from "../../components/SkillModal";
import ApplyModal from "../../components/ApplyModal";
import ReportModal from "../../components/ReportModal";
import { getNearbySkillsAPI, getSkillsAPI } from "../../api/skill";
// import PostSkeleton from "../../components/";

const LocationDisplay = ({ location, distance }) => {
  if (!location) return null;

  return (
    <div className="flex items-center space-x-1 text-sm text-gray-500 mt-2">
      <MapPin className="w-3 h-3" />
      <span>{location.locationName}</span>
      {distance !== undefined && (
        <span className="text-blue-600 font-medium">
          • {distance === 0 ? "Very close" : `${distance}km away`}
        </span>
      )}
    </div>
  );
};

const FeedCard = ({ item, type, appliedIds, onApplyClick }) => {
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
      className={`relative bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow ${
        !isNeed && "border-purple-100"
      }`}
    >
      {!isOwnPost && !isAnonymous && (
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

      {/* Location display */}
      <LocationDisplay location={item.location} distance={item.distance} />

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

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);
  const [view, setView] = useState("needs");
  const [appCount, setAppCount] = useState(0);
  const [allMatches, setAllMatches] = useState([]);
  const [appliedNeedIds, setAppliedNeedIds] = useState(new Set());
  const [showNeedModal, setShowNeedModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Location-related states
  const [userLocation, setUserLocation] = useState(null);
  const [locationRadius, setLocationRadius] = useState(10); // km
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // ✅ MOVED HOOKS TO TOP: This fixes the "Rendered more hooks" error.
  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.location?.locationName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, posts]);

  const filteredSkills = useMemo(() => {
    if (!searchTerm) return skills;
    return skills.filter(
      (skill) =>
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.location?.locationName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, skills]);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (error) => {
          console.log("Location access denied or failed:", error);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000, // 10 minutes
        }
      );
    }
  }, []);

  const loadFeeds = async () => {
    setLoadingFeeds(true);
    try {
      if (userLocation) {
        // If we have a location, fetch nearby items
        const [needsData, skillsData] = await Promise.all([
          getNearbyNeedsAPI(userLocation, locationRadius),
          getNearbySkillsAPI(userLocation, locationRadius),
        ]);
        setPosts(needsData);
        setSkills(skillsData);
      } else {
        // Fallback if location is not available
        const [needsData, skillsData] = await Promise.all([
          getNeedsAPI(),
          getSkillsAPI(),
        ]);
        setPosts(needsData);
        setSkills(skillsData);
      }
    } catch (error) {
      console.error("Error loading feeds:", error);
      // Set to empty array on error to prevent crash
      setPosts([]);
      setSkills([]);
    }
    setLoadingFeeds(false);
  };
  useEffect(() => {
    loadFeeds();
  }, [userLocation, locationRadius]);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    const q = query(
      collection(db, "applications"),
      where("seekerUid", "==", user.uid),
      where("status", "==", "pending")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setAppCount(querySnapshot.size);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const [profileData, matchesData, sentAppsData] = await Promise.all([
          axios.get("http://localhost:5007/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          getMatchesForUser(),
          getApplicationsByHelper(),
        ]);
        setProfile(profileData.data);
        setAllMatches(matchesData);
        setAppliedNeedIds(new Set(sentAppsData.map((app) => app.needId)));
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchData();
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error("Location error:", error);
        alert(
          "Unable to get your location. Please check your browser settings."
        );
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000,
      }
    );
  };

  if (authLoading) return null;
  if (!user) return <p>Please login to continue.</p>;

  const activeMatchCount = allMatches.filter(
    (match) => match.status !== "completed"
  ).length;
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
              <div className="w-8 h-8 bg-gradient-to-r rounded-lg flex items-center justify-center">
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
                  placeholder="Search posts or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border-gray-400 shadow-xl border rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Location controls */}
              <div className="relative">
                <button
                  onClick={() => setShowLocationSettings(!showLocationSettings)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    userLocation
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  disabled={locationLoading}
                >
                  <MapPin
                    className={`w-4 h-4 ${
                      locationLoading ? "animate-pulse" : ""
                    }`}
                  />
                  <span>
                    {locationLoading
                      ? "Getting location..."
                      : userLocation
                      ? `${locationRadius}km radius`
                      : "Set location"}
                  </span>
                </button>

                {showLocationSettings && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowLocationSettings(false)}
                    />
                    <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border p-4 w-80 z-20">
                      <h3 className="font-medium mb-4 flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Location Settings
                      </h3>

                      <div className="space-y-4">
                        {/* Current location status */}
                        <div className="text-sm">
                          <span className="text-gray-600">Status: </span>
                          <span
                            className={
                              userLocation ? "text-green-600" : "text-gray-500"
                            }
                          >
                            {userLocation
                              ? "Location enabled"
                              : "Location not set"}
                          </span>
                        </div>

                        {/* Search radius */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Search radius: {locationRadius}km
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="50"
                            value={locationRadius}
                            onChange={(e) =>
                              setLocationRadius(parseInt(e.target.value))
                            }
                            className="w-full accent-blue-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1km (nearby)</span>
                            <span>50km (city-wide)</span>
                          </div>
                        </div>

                        {/* Get location button */}
                        <button
                          onClick={getCurrentLocation}
                          disabled={locationLoading}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full transition-colors"
                        >
                          <Navigation
                            className={`w-4 h-4 ${
                              locationLoading ? "animate-spin" : ""
                            }`}
                          />
                          <span>
                            {locationLoading
                              ? "Getting location..."
                              : "Update location"}
                          </span>
                        </button>

                        {/* Info text */}
                        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                          <p>
                            💡 Setting your location helps you see nearby posts
                            first and increases your chances of meaningful
                            connections!
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

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
                            />
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
                          />
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
                <p className="text-2xl font-bold">{activeMatchCount}</p>
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
              {userLocation && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (within {locationRadius}km)
                </span>
              )}
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
              <div>loading</div>
              {/* <PostSkeleton />
              <PostSkeleton /> */}
            </>
          ) : view === "needs" ? (
            filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <FileText className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold">
                  {searchTerm
                    ? "No matching requests found"
                    : userLocation
                    ? `No requests found within ${locationRadius}km`
                    : "No requests posted yet"}
                </h3>
                {userLocation && !searchTerm && (
                  <p className="text-gray-500 mt-2">
                    Try increasing your search radius or{" "}
                    <button
                      onClick={() => setLocationRadius(50)}
                      className="text-blue-600 hover:underline"
                    >
                      search city-wide
                    </button>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
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
          ) : // Skills view
          filteredSkills.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <Users className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold">
                {searchTerm
                  ? "No matching skills found"
                  : userLocation
                  ? `No skills found within ${locationRadius}km`
                  : "No skills offered yet"}
              </h3>
              {userLocation && !searchTerm && (
                <p className="text-gray-500 mt-2">
                  Try increasing your search radius or{" "}
                  <button
                    onClick={() => setLocationRadius(50)}
                    className="text-blue-600 hover:underline"
                  >
                    search city-wide
                  </button>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSkills.map((skill) => (
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
