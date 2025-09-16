import { useEffect, useState } from "react";
import { getNeedsAPI, getNearbyNeedsAPI } from "../api/need";
import { getSkillsAPI, getNearbySkillsAPI } from "../api/skill";

export default function useFeeds(location, radius) {
  const [posts, setPosts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeeds = async () => {
    setLoading(true);
    try {
      if (location) {
        const [needs, skillList] = await Promise.all([
          getNearbyNeedsAPI(location, radius),
          getNearbySkillsAPI(location, radius),
        ]);
        setPosts(needs);
        setSkills(skillList);
      } else {
        const [needs, skillList] = await Promise.all([
          getNeedsAPI(),
          getSkillsAPI(),
        ]);
        setPosts(needs);
        setSkills(skillList);
      }
    } catch (e) {
      console.error("Error fetching feeds:", e);
      setPosts([]);
      setSkills([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFeeds();
  }, [location, radius]);

  return { posts, skills, loading, reload: loadFeeds };
}
