import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import React from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen space-x-2">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:200ms]"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:400ms]"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return children;
}
