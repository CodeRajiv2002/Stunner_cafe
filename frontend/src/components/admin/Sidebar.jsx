import React, { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  History,
  TableProperties,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  counts,
}) => {
  const sidebarRef = useRef(null);

  // --- 1. CLICK OUTSIDE TO CLOSE LOGIC ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If sidebar is open and click is outside the sidebarRef, close it
      if (
        !isCollapsed &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCollapsed, setIsCollapsed]);

  const menuItems = [
    {
      id: "new_orders",
      label: "Live Orders",
      icon: LayoutDashboard,
      badge: counts?.orders,
    },
    {
      id: "chats",
      label: "Table Chats",
      icon: MessageSquare,
      badge: counts?.chats,
    },
    { id: "tables", label: "Tables", icon: TableProperties },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ease-in-out h-full z-50 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* BRANDING */}
      <div className="p-6 flex items-center justify-between min-h-20">
        <div className="overflow-hidden">
          {!isCollapsed && (
            <h1 className="text-xl font-black text-orange-500 tracking-tighter whitespace-nowrap">
              STUNNER <span className="text-slate-800">CAFE</span>
            </h1>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative group flex items-center w-full p-3 rounded-2xl font-bold transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              {/* ✅ ICON CONTAINER: Fixed width ensures icons don't jump during transition */}
              <div className="shrink-0 w-8 flex items-center justify-center relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />

                {/* --- NOTIFICATION BADGE --- */}
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-1 flex h-5 w-5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] text-white items-center justify-center border-2 border-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  </span>
                )}
              </div>

              {/* ✅ LABEL: Added transition and overflow control */}
              <span
                className={`ml-3 text-sm tracking-tight transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100"
                }`}
              >
                {item.label}
              </span>

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label} {item.badge > 0 ? `(${item.badge})` : ""}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
