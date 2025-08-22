import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";
// 1. Import Firestore functions
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Get a reference to the Firestore database
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        setUser(user);

        // 3. Update the user's 'lastSeen' timestamp on login/activity
        const userRef = doc(db, "users", user.uid);
        try {
          await setDoc(
            userRef,
            { lastSeen: serverTimestamp() }, // Use server's time for accuracy
            { merge: true } // Creates/merges the field without overwriting other data
          );
        } catch (error) {
          console.error("Error updating lastSeen timestamp:", error);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
