import React, { useState, useMemo, useDeferredValue } from "react";
import { useAuth } from "../../hooks/useAuth";
import { auth } from "../../utils/firebase";
import useFeeds from "../../hooks/useFeeds";
import useUserLocation from "../../hooks/useUserLocation";
import useProfile from "../../hooks/useProfile";
import useApplications from "../../hooks/useApplications";

import Header from "./components/Header";
import StatsOverview from "./components/StatsOverview";
import FeedCard from "./components/FeedCard";
import SOSModal from "../../components/SosModal";
import NewPostModal from "../../components/NewPostModal";
import NewSkillModal from "../../components/SkillModal";
import ApplyModal from "../../components/ApplyModal";

import { Virtuoso } from "react-virtuoso";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();

  const {
    location,
    loading: locationLoading,
    updateLocation,
  } = useUserLocation();
  const [locationRadius, setLocationRadius] = useState(null);

  const {
    posts,
    skills,
    loading: feedsLoading,
    reload,
  } = useFeeds(location, locationRadius);
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  const { profile, matches, appliedNeedIds } = useProfile(user);
  const appCount = useApplications(user);

  const [view, setView] = useState("needs");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [activeItem, setActiveItem] = useState(null);

  const [showSOS, setShowSOS] = useState(false);
  const [showNeed, setShowNeed] = useState(false);
  const [showSkill, setShowSkill] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Build the list (hook must be before any conditional returns)
  const listToRender = useMemo(() => {
    const base = view === "needs" ? posts : skills;
    const q = (deferredSearch || "").toLowerCase();
    if (!q) return base;
    return base.filter((item) => item.title?.toLowerCase().includes(q));
  }, [view, posts, skills, deferredSearch]);

  // Loading state (returns are after all hooks)
  if (authLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 animate-pulse"></div>
          <p className="text-xl font-semibold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">
            Loading your experience...
          </p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <p className="text-2xl font-bold text-slate-800">
            Please login to continue ✨
          </p>
        </div>
      </div>
    );

  const displayName = profile?.name || user.displayName || user.email;
  const initials = displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeMatchCount = matches.filter(
    (m) => m.status !== "completed"
  ).length;

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "4s" }}
      ></div>

      <Header
        view={view}
        setView={setView}
        initials={initials}
        displayName={displayName}
        email={user.email}
        appCount={appCount}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        onSetShowSOS={() => setShowSOS(true)}
        onSetShowSkill={() => setShowSkill(true)}
        onSetShowNeed={() => setShowNeed(true)}
        onToggleProfile={() =>
          setOpenDropdown(openDropdown === "profile" ? null : "profile")
        }
        onLogout={handleLogout}
        locationLoading={locationLoading}
        userLocation={location}
        locationRadius={locationRadius}
        setLocationRadius={setLocationRadius}
        showLocationSettings={showLocationSettings}
        toggleLocationSettings={() =>
          setShowLocationSettings(!showLocationSettings)
        }
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearLocationFilter={() => setLocationRadius(null)}
        getCurrentLocation={updateLocation}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats */}
        <div className="mb-8">
          <StatsOverview
            posts={posts}
            skills={skills}
            activeMatchCount={activeMatchCount}
          />
        </div>

        {/* Modern Tab Switcher */}
        <div className="flex justify-center items-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl opacity-20 blur animate-pulse"></div>
            <div className="relative flex space-x-1 p-1.5 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/40">
              <button
                onClick={() => setView("needs")}
                className={`relative px-8 py-4 text-sm font-bold rounded-xl transition-all duration-500 transform hover:scale-105 ${
                  view === "needs"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-xl shadow-blue-200"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-800"
                }`}
              >
                <span className="relative z-10">🆘 Help Requests</span>
                {view === "needs" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl opacity-20 animate-pulse"></div>
                )}
              </button>
              <button
                onClick={() => setView("skills")}
                className={`relative px-8 py-4 text-sm font-bold rounded-xl transition-all duration-500 transform hover:scale-105 ${
                  view === "skills"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl shadow-purple-200"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-800"
                }`}
              >
                <span className="relative z-10">✨ Available Skills</span>
                {view === "skills" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl opacity-20 animate-pulse"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feed List (virtualized) */}
        <div className="relative">
          {feedsLoading ? (
            <div className="text-center py-16">
              <div className="inline-block relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl animate-spin mx-auto mb-4"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl opacity-30 animate-ping"></div>
              </div>
              <p className="text-xl font-semibold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">
                Loading amazing opportunities... ✨
              </p>
            </div>
          ) : listToRender.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">
                No {view === "needs" ? "requests" : "skills"} found
              </h3>
              <p className="text-slate-500 font-medium">
                {deferredSearch
                  ? `No results for "${deferredSearch}". Try a different search term.`
                  : `No ${
                      view === "needs" ? "help requests" : "skills"
                    } available right now.`}
              </p>
            </div>
          ) : listToRender.length <= 8 ? (
            <div className="space-y-6">
              {listToRender.map((item, index) => (
                <div
                  key={item.needId || item.skillId}
                  className="animate-slideInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <FeedCard
                    item={item}
                    type={view}
                    appliedIds={appliedNeedIds}
                    onApplyClick={setActiveItem}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Virtuoso
              useWindowScroll
              data={listToRender}
              increaseViewportBy={{ top: 400, bottom: 800 }}
              itemContent={(index, item) => (
                <div
                  className="animate-slideInUp mb-6"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <FeedCard
                    item={item}
                    type={view}
                    appliedIds={appliedNeedIds}
                    onApplyClick={setActiveItem}
                  />
                </div>
              )}
            />
          )}
        </div>
      </main>
      {/* Modals */}
      {showSOS && (
        <SOSModal onClose={() => setShowSOS(false)} onPostCreated={reload} />
      )}
      {showNeed && (
        <NewPostModal
          onClose={() => setShowNeed(false)}
          onPostCreated={reload}
        />
      )}
      {showSkill && (
        <NewSkillModal
          onClose={() => setShowSkill(false)}
          onSkillCreated={reload}
        />
      )}
      {activeItem && (
        <ApplyModal
          needId={activeItem.needId || activeItem.skillId}
          onClose={() => setActiveItem(null)}
          onApplySuccess={() => reload()}
        />
      )}
      {/* Animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
