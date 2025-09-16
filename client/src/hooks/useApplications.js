import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function useApplications(user) {
  const [appCount, setAppCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    const q = query(
      collection(db, "applications"),
      where("seekerUid", "==", user.uid),
      where("status", "==", "pending")
    );
    const unsubscribe = onSnapshot(q, (snap) => setAppCount(snap.size));
    return () => unsubscribe();
  }, [user]);

  return appCount;
}
