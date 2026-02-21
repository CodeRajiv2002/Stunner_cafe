import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeadr";

const AdminLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AdminHeader />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
