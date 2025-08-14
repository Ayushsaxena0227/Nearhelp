import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ProtectedRoute from "./contexts/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route
        path="/home"
        element={
          // <ProtectedRoute>
          <Home />
          // {/* </ProtectedRoute> */}
        }
      />

      {/* Default redirect: if they visit root, send them to /home */}
      <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default App;
