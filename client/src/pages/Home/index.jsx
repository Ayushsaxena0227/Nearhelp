import React, { useState } from "react";
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

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();

  const {
    location,
    loading: locationLoading,
    updateLocation,
    setLocation,
  } = useUserLocation();
  const {
    posts,
    skills,
    loading: feedsLoading,
    reload,
  } = useFeeds(location, 10);
  const { profile, matches, appliedNeedIds, setAppliedNeedIds } =
    useProfile(user);
  const appCount = useApplications(user);

  const [view, setView] = useState("needs");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeItem, setActiveItem] = useState(null);

  const [showSOS, setShowSOS] = useState(false);
  const [showNeed, setShowNeed] = useState(false);
  const [showSkill, setShowSkill] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  if (authLoading) return null;
  if (!user) return <p>Please login</p>;

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
    <div className="min-h-screen bg-gray-50">
      <Header
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
        locationRadius={10}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearLocationFilter={() => setLocation(null)}
        getCurrentLocation={updateLocation}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsOverview
          posts={posts}
          skills={skills}
          activeMatchCount={activeMatchCount}
        />
        <div>
          {feedsLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-6">
              {(view === "needs" ? posts : skills)
                .filter((item) =>
                  item.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((item) => (
                  <FeedCard
                    key={item.needId || item.skillId}
                    item={item}
                    type={view}
                    appliedIds={appliedNeedIds}
                    onApplyClick={setActiveItem}
                  />
                ))}
            </div>
          )}
        </div>
      </main>

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
    </div>
  );
}
