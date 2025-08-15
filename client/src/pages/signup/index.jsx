import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
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

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
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
        {/* Left Side - Sign up form */}
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

                {/* <div className="text-sm text-gray-600">
                  <label className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <span>
                      I agree to the{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div> */}

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

        {/* Right Side - Features */}
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

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-800">
                    Post & Browse Needs
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Share what you need help with or browse requests from
                  neighbors
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-800">
                    Offer Your Skills
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Share your talents and help neighbors while building
                  reputation
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-800">
                    Safe & Verified
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Community ratings and verification system for trusted
                  connections
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
