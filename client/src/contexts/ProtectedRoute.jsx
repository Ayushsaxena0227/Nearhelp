import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import React from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {/* Skeleton Loader or Spinner */}
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return children;
}
