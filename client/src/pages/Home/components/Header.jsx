import { Link } from "react-router-dom";
import React from "react";
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
} from "lucide-react";
import Nearhelp_logo from "../../../assets/Nearhelp_logo/help.png";

export default function Header({
  initials,
  displayName,
  email,
  appCount,
  locationLoading,
  userLocation,
  locationRadius,
  onSetShowSOS,
  onSetShowSkill,
  onSetShowNeed,
  onToggleProfile,
  onLogout,
  showLocationSettings,
  toggleLocationSettings,
  setLocationRadius,
  clearLocationFilter,
  getCurrentLocation,
  openDropdown,
  setOpenDropdown,
  searchTerm,
  setSearchTerm,
}) {
  return (
    <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + SOS */}
          <Link to="/home" className="flex items-center space-x-2">
            <img src={Nearhelp_logo} className="w-8 h-8" alt="Nearhelp" />
            <span className="text-xl font-bold">NearHelp</span>
            <button
              onClick={onSetShowSOS}
              className="px-4 py-2 bg-red-600 text-white rounded-xl flex items-center animate-pulse"
            >
              <Siren size={16} />{" "}
              <span className="hidden sm:inline ml-2">SOS</span>
            </button>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8 relative">
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

            {/* Notifications */}
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
                onClick={() => onToggleProfile()}
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
                      to={`/profile/me`}
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
