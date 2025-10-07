import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./contexts/ProtectedRoute";
import MyApplications from "./pages/Application";
import Chat from "./pages/Chat";
import Matches from "./pages/Match";
import HomePage from "./pages/Home";
import ProfilePage from "./pages/Profile";
import { useEffect, useContext } from "react";
import { Toaster } from "react-hot-toast";

import {
  handleForegroundMessages,
  initializeNotifications,
} from "./utils/firebase-messaging-config";
// Import your auth context (adjust the import path as needed)
// import { AuthContext } from "./contexts/AuthContext";

function App() {
  // If you have an auth context, use it like this:
  // const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    // Always setup foreground message handling
    handleForegroundMessages();
  }, []);

  // Separate effect for authenticated users
  useEffect(() => {
    const setupNotificationsForAuthenticatedUser = async () => {
      // Check if user is authenticated
      const authToken = localStorage.getItem("token");

      if (authToken) {
        try {
          console.log("User authenticated, initializing notifications...");
          await initializeNotifications();
        } catch (error) {
          console.error(
            "Failed to setup notifications for authenticated user:",
            error
          );
        }
      }
    };

    // Small delay to ensure auth state is properly set
    const timer = setTimeout(setupNotificationsForAuthenticatedUser, 1000);

    return () => clearTimeout(timer);
  }, []); // You can add dependency like [user] if you have auth context

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:matchId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
