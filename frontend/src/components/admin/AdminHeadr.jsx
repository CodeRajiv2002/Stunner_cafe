import React from "react";
import { LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/adminlogin");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="relative max-w-7xl mx-auto flex items-center justify-between gap-4 p-3 md:p-4">
        {/* Left: Logo */}
        <Link to="/admin" className="w-16 md:w-24">
          <img src={logo} alt="Admin Logo" className="rounded-lg" />
        </Link>

        {/* Center: Title */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg md:text-xl font-extrabold text-orange-500 tracking-tight">
          Admin Panel
        </h1>

        {/* Right: Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-md"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
