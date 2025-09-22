import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../../../utils/firebase";
import {
  ChevronDown,
  Siren,
  Search,
  Plus,
  Bell,
  FileText,
  User,
  MessageSquare,
  LogOut,
  Navigation,
  XCircle,
  MapPin,
  Settings,
} from "lucide-react";
import Nearhelp_logo from "../../../assets/Nearhelp_logo/help.png";

// We receive all the necessary props from HomePage
export default function Header({
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
  // 👇 ADDED a prop to receive the view state and the function to change it
  view,
  setView,
  // 👇 ADDED back all the location-related props
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
    <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + SOS */}
          <div className="flex items-center space-x-4">
            <Link to="/home" className="flex items-center space-x-2">
              <img src={Nearhelp_logo} className="w-8 h-8" alt="Nearhelp" />
              <span className="text-xl font-bold">NearHelp</span>
            </Link>
            <button
              onClick={onSetShowSOS}
              className="px-3 py-2 bg-red-600 text-white rounded-xl flex items-center animate-pulse text-sm font-semibold"
            >
              <Siren size={16} />
              <span className="hidden sm:inline ml-2">SOS</span>
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-0 sm:mx-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2.5 border rounded-xl"
            />
          </div>

          {/* Right-side buttons */}
          <div className="flex items-center space-x-2">
            {/* --- LOCATION CONTROLS ADDED BACK --- */}
            <div className="relative">
              <button
                onClick={toggleLocationSettings}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors font-semibold ${
                  userLocation
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                disabled={locationLoading}
              >
                <MapPin
                  className={`w-4 h-4 ${
                    locationLoading ? "animate-pulse" : ""
                  }`}
                />
                <span>
                  {locationLoading
                    ? "Finding..."
                    : userLocation
                    ? locationRadius
                      ? `${locationRadius} km Radius`
                      : "All Locations"
                    : "Set Location"}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showLocationSettings ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showLocationSettings && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={toggleLocationSettings}
                  />
                  <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border p-4 w-72 z-20">
                    <h3 className="font-medium mb-4 flex items-center text-gray-800">
                      <Settings className="w-4 h-4 mr-2" />
                      Location Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Search radius:{" "}
                          <span className="font-bold">{locationRadius}km</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={locationRadius || 25} // fall back to 25 if null
                          onChange={(e) =>
                            setLocationRadius(parseInt(e.target.value))
                          }
                          className="w-full"
                        />
                        <p className="block text-sm text-gray-600 mb-2">
                          use slider for finding post
                        </p>
                      </div>
                      <button
                        onClick={clearLocationFilter}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-semibold"
                      >
                        <XCircle size={16} />
                        <span>Show All (No Filter)</span>
                      </button>
                      {/* <button
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full"
                      >
                        <Navigation
                          className={`w-4 h-4 ${
                            locationLoading ? "animate-spin" : ""
                          }`}
                        />
                        <span>
                          {locationLoading ? "Getting..." : "Update Location"}
                        </span>
                      </button> */}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Other Buttons */}
            <button
              onClick={onSetShowSkill}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl flex items-center text-sm font-semibold"
            >
              <Plus size={16} />{" "}
              <span className="ml-2 hidden sm:inline">Offer Skill</span>
            </button>
            <button
              onClick={onSetShowNeed}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center text-sm font-semibold"
            >
              <Plus size={16} />{" "}
              <span className="ml-2 hidden sm:inline">Post Need</span>
            </button>
            <Link
              to="/my-applications"
              className="relative p-2 hover:bg-gray-100 rounded-full"
            >
              <Bell size={20} />
              {appCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                  {appCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <div
                className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-gray-100"
                onClick={onToggleProfile}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{initials}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 ${
                    openDropdown === "profile" ? "rotate-180" : ""
                  }`}
                />
              </div>
              {openDropdown === "profile" && (
                <div className="absolute top-12 right-0 bg-white rounded-xl shadow-lg border w-64 z-20">
                  <div className="p-4 border-b">
                    <p className="font-semibold">{displayName}</p>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to={`/profile/${auth.currentUser.uid}`}
                      className="flex items-center px-4 py-2 hover:bg-gray-50"
                    >
                      <User size={16} className="mr-3" /> View Profile
                    </Link>
                    <Link
                      to="/my-applications"
                      className="flex items-center px-4 py-2 hover:bg-gray-50"
                    >
                      <FileText size={16} className="mr-3" /> Applications
                    </Link>
                    <Link
                      to="/matches"
                      className="flex items-center px-4 py-2 hover:bg-gray-50"
                    >
                      <MessageSquare size={16} className="mr-3" /> Messages
                    </Link>
                  </div>
                  <div className="border-t p-2">
                    <button
                      onClick={onLogout}
                      className="flex items-center px-4 py-2 w-full text-left text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} className="mr-3" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
