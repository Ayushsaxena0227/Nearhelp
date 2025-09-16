import { FileText, MessageSquare, Users } from "lucide-react";
import React from "react";
export default function StatsOverview({ posts, skills, activeMatchCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
        <p className="text-blue-100 text-sm">Active Requests</p>
        <p className="text-2xl font-bold">{posts.length}</p>
        <FileText className="w-10 h-10 text-blue-200 float-right" />
      </div>
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
        <p className="text-green-100 text-sm">Active Chats</p>
        <p className="text-2xl font-bold">{activeMatchCount}</p>
        <MessageSquare className="w-10 h-10 text-green-200 float-right" />
      </div>
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <p className="text-purple-100 text-sm">Offered Skills</p>
        <p className="text-2xl font-bold">{skills.length}</p>
        <Users className="w-10 h-10 text-purple-200 float-right" />
      </div>
    </div>
  );
}
