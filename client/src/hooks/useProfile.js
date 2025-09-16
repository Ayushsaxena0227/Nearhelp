import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { getMatchesForUser } from "../api/matches";
import { getApplicationsByHelper } from "../api/application";
import axios from "axios";

export default function useProfile(user) {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [appliedNeedIds, setAppliedNeedIds] = useState(new Set());

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const [profileData, matchesData, apps] = await Promise.all([
          axios.get("http://localhost:5007/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          getMatchesForUser(),
          getApplicationsByHelper(),
        ]);
        setProfile(profileData.data);
        setMatches(matchesData);
        setAppliedNeedIds(new Set(apps.map((a) => a.needId)));
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetch();
  }, [user]);

  return { profile, matches, appliedNeedIds, setAppliedNeedIds };
}
