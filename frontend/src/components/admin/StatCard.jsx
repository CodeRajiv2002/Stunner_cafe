import React from "react";

/**
 * StatCard Component
 * @param {LucideIcon} icon - An icon component from lucide-react
 * @param {string} label - The title of the metric
 * @param {string|number} value - The main number/stat to display
 * @param {string} colorClass - Tailwind classes for the icon background and text color
 * @param {boolean} animate - Whether the value should have a pulse animation
 */
const StatCard = ({ icon: Icon, label, value, colorClass, animate }) => {
  return (
    <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
      {/* Icon Container */}
      <div
        className={`p-4 rounded-2xl ${colorClass} flex items-center justify-center`}
      >
        {Icon && <Icon size={28} strokeWidth={2.5} />}
      </div>

      {/* Text Content */}
      <div className="flex flex-col">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <h2
          className={`text-3xl font-black text-slate-900 tracking-tighter ${animate ? "animate-pulse text-orange-500" : ""}`}
        >
          {value}
        </h2>
      </div>
    </div>
  );
};

export default StatCard;
