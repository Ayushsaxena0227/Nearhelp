import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../utils/firebase";
import {
  ArrowRight,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  Shield,
  Star,
  User,
  Users,
} from "lucide-react";
import axios from "axios";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 👇 NEW function for handling Google Signup
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      const token = await userCred.user.getIdToken();

      // Call the same smart endpoint
      await axios.post(
        "http://localhost:5007/users/social-login",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      window.location.href = "/home";
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Your original handleSignup function is unchanged
  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCred.user.getIdToken();

      const res = await fetch("http://localhost:5007/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          location: null,
          skills: [],
          badges: [],
        }),
      });

      const data = await res.json();
      console.log("User profile creation:", data);

      if (res.ok) {
        window.location.href = "/home";
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  // Your entire JSX return statement is unchanged, except for the new button
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">NeighborHub</span>
          </div>
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Already have an account?
          </a>
        </div>
      </div>
      <div className="flex min-h-screen">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                  Join your neighborhood
                </h2>
                <p className="text-gray-600 mt-2">
                  Connect with neighbors and build community
                </p>
              </div>

              {/* 👇 NEW "Sign up with Google" button */}
              <button
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 mb-4 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Phone number (optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-medium py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Create account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Build meaningful connections
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of neighbors already helping each other. Share
              skills, offer help, and discover your community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
