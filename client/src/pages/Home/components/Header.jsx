import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../../../utils/firebase";
import {
  ChevronDown,
  Siren,
  Search,
  Bell,
  FileText,
  User,
  MessageSquare,
  LogOut,
  XCircle,
  MapPin,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import Nearhelp_logo from "../../../assets/Nearhelp_logo/help.png";

function Header({
  initials,
  displayName,
  email,
  appCount,
  onSetShowSOS,
  onSetShowSkill,
  onSetShowNeed,
  onToggleProfile,
  onLogout,
  openDropdown,
  searchTerm,
  setSearchTerm,
  view,
  setView,
  locationLoading,
  userLocation,
  locationRadius,
  showLocationSettings,
  toggleLocationSettings,
  setLocationRadius,
  clearLocationFilter,
  getCurrentLocation,
}) {
  return (
    <header className="bg-gradient-to-r from-white via-slate-50 to-white backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/60 shadow-lg shadow-slate-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2 gap-4">
          {/* Logo + SOS */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Link to="/home" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src={Nearhelp_logo}
                  className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
                  alt="Nearhelp"
                />
                <div className="absolute inset-0 bg-blue-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent whitespace-nowrap">
                NearHelp
              </span>
            </Link>
            <button
              onClick={onSetShowSOS}
              className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-bold animate-pulse hover:animate-none hover:scale-105 group whitespace-nowrap"
            >
              <Siren
                size={18}
                className="group-hover:rotate-12 transition-transform duration-300"
              />
              <span className="hidden sm:inline ml-2">Emergency SOS</span>
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-0 max-w-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300 z-10" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="w-[130px] pl-12 pr-6 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium placeholder-slate-400 hover:border-slate-300"
              />
            </div>
          </div>
          {/* Right-side buttons */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Location Controls */}
            <div className="relative">
              <button
                onClick={toggleLocationSettings}
                className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-sm transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap ${
                  userLocation
                    ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-white hover:from-emerald-500 hover:to-cyan-600"
                    : "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300"
                }`}
                disabled={locationLoading}
              >
                <MapPin
                  className={`w-4 h-4 ${locationLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden lg:inline">
                  {locationLoading
                    ? "Finding..."
                    : userLocation
                    ? locationRadius
                      ? `${locationRadius}km`
                      : "Global"
                    : "Set Location"}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    showLocationSettings ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showLocationSettings && (
                <>
                  <div
                    className="fixed inset-0 z-10 bg-black/10"
                    onClick={toggleLocationSettings}
                  />
                  <div className="absolute top-16 right-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 w-80 z-20 animate-slideDown">
                    <h3 className="font-bold mb-6 flex items-center text-slate-800 text-lg">
                      <Settings className="w-5 h-5 mr-3 text-blue-500" />
                      Location Settings
                    </h3>
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                        <label className="block text-sm text-slate-600 mb-3 font-medium">
                          Search radius:
                          <span className="font-bold text-blue-600 ml-2">
                            {locationRadius || 25}km
                          </span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={locationRadius || 25}
                          onChange={(e) =>
                            setLocationRadius(parseInt(e.target.value))
                          }
                          className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <p className="text-xs text-slate-500 mt-2 font-medium">
                          Adjust to find posts within your preferred distance 📍
                        </p>
                      </div>
                      <button
                        onClick={clearLocationFilter}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-xl transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <XCircle size={16} />
                        <span>Show All Locations 🌍</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <button
              onClick={onSetShowSkill}
              className="px-4 lg:px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl flex items-center text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group whitespace-nowrap"
            >
              <Sparkles
                size={16}
                className="group-hover:rotate-12 transition-transform duration-300"
              />
              <span className="ml-2 hidden lg:inline">Offer Skill</span>
            </button>

            <button
              onClick={onSetShowNeed}
              className="px-4 lg:px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-2xl flex items-center text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group whitespace-nowrap"
            >
              <Zap
                size={16}
                className="group-hover:rotate-12 transition-transform duration-300"
              />
              <span className="ml-2 hidden lg:inline">Request Help</span>
            </button>

            <Link
              to="/my-applications"
              className="relative p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl transition-all duration-300 transform hover:scale-110 group"
            >
              <Bell
                size={20}
                className="text-slate-600 group-hover:text-blue-600 transition-colors duration-300"
              />
              {appCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 font-bold animate-bounce shadow-lg">
                  {appCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <div
                className="flex items-center space-x-3 cursor-pointer p-2 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105 group"
                onClick={onToggleProfile}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white font-bold">{initials}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-all duration-300 hidden lg:block ${
                    openDropdown === "profile" ? "rotate-180 text-blue-500" : ""
                  }`}
                />
              </div>
              {openDropdown === "profile" && (
                <div className="absolute top-16 right-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-72 z-20 overflow-hidden animate-slideDown">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-slate-100">
                    <p className="font-bold text-slate-800 text-lg">
                      {displayName}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {email}
                    </p>
                  </div>
                  <div className="py-3">
                    <Link
                      to={`/profile/${auth.currentUser.uid}`}
                      className="flex items-center px-6 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                    >
                      <User
                        size={18}
                        className="mr-4 text-slate-500 group-hover:text-blue-500 transition-colors duration-300"
                      />
                      <span className="font-medium text-slate-700">
                        View Profile
                      </span>
                    </Link>
                    <Link
                      to="/my-applications"
                      className="flex items-center px-6 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                    >
                      <FileText
                        size={18}
                        className="mr-4 text-slate-500 group-hover:text-green-500 transition-colors duration-300"
                      />
                      <span className="font-medium text-slate-700">
                        Applications
                      </span>
                    </Link>
                    <Link
                      to="/matches"
                      className="flex items-center px-6 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                    >
                      <MessageSquare
                        size={18}
                        className="mr-4 text-slate-500 group-hover:text-purple-500 transition-colors duration-300"
                      />
                      <span className="font-medium text-slate-700">
                        Messages
                      </span>
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 p-3">
                    <button
                      onClick={onLogout}
                      className="flex items-center px-6 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium group"
                    >
                      <LogOut
                        size={18}
                        className="mr-4 group-hover:rotate-12 transition-transform duration-300"
                      />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </header>
  );
}

export default React.memo(Header);
