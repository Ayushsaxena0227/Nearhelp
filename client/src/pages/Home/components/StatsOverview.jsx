import React from "react";
import { Users, Heart, Zap, TrendingUp, Star, Target } from "lucide-react";

export default function StatsOverview({ posts, skills, activeMatchCount }) {
  const totalPosts = posts?.length || 0;
  const totalSkills = skills?.length || 0;
  const totalCommunitySize = totalPosts + totalSkills;

  const stats = [
    {
      icon: Heart,
      label: "Help Requests",
      value: totalPosts,
      change: "+12%",
      color: "from-red-400 to-pink-500",
      bgColor: "from-red-50 to-pink-50",
      iconColor: "text-red-500",
      description: "People seeking help",
    },
    {
      icon: Zap,
      label: "Available Skills",
      value: totalSkills,
      change: "+8%",
      color: "from-purple-400 to-indigo-500",
      bgColor: "from-purple-50 to-indigo-50",
      iconColor: "text-purple-500",
      description: "Ready to help others",
    },
    {
      icon: Users,
      label: "Active Community",
      value: totalCommunitySize,
      change: "+15%",
      color: "from-blue-400 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-500",
      description: "Total community members",
    },
    {
      icon: Target,
      label: "Your Matches",
      value: activeMatchCount,
      change: "New!",
      color: "from-emerald-400 to-green-500",
      bgColor: "from-emerald-50 to-green-50",
      iconColor: "text-emerald-500",
      description: "Active connections",
    },
  ];

  return (
    <div className="relative mb-8">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 rounded-3xl blur-xl"></div>

      <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl shadow-slate-200/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Community Dashboard
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Building connections, sharing skills, creating impact
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden animate-slideUp"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Card Background with Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} rounded-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-300`}
                ></div>
                <div className="absolute inset-0 bg-white/40 rounded-2xl"></div>

                {/* Card Content */}
                <div className="relative p-6 rounded-2xl border border-white/30 backdrop-blur-sm group-hover:scale-105 transition-all duration-300 cursor-pointer">
                  {/* Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-slate-800 mb-1 group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold text-slate-600">
                      {stat.label}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-xs text-slate-500 font-medium">
                    {stat.description}
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action Banner */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center shadow-xl">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Star className="w-5 h-5 animate-pulse" />
            <h3 className="text-xl font-bold">Ready to Make a Difference?</h3>
            <Star className="w-5 h-5 animate-pulse" />
          </div>
          <p className="text-sm font-medium opacity-90">
            Join our growing community of helpers and seekers. Every skill
            matters, every request counts!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
