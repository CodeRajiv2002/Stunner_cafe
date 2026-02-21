import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/Admin";
import AdminLogin from "./components/admin/AdminLogin";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import PublicLayout from "./Layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* 🌐 Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
        </Route>

        {/* 🔐 Admin Login (No Layout) */}
        <Route path="/adminlogin" element={<AdminLogin />} />

        {/* 🔒 Admin Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
