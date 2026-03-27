import React, { useState, useMemo, useEffect } from "react";
import { AlertCircle, Clock, CheckCircle, Coffee } from "lucide-react";
import OrderCard from "./OrderCard";
import {
  getNewOrders,
  updateOrderStatus as updateOrderAPI,
} from "../../utils/deviceId";
import { socket } from "../../socket";
import { toast } from "sonner";

const AdminOrder = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);

  // --- 1. FETCH ALL TODAY'S ORDERS ---
  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await getNewOrders();
      if (response.success && response.data) {
        setAllOrders(response.data.data);
      } else {
        toast.error(response.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.message || "Failed to fetch today's orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // --- 2. REAL-TIME SOCKET LISTENER ---
  useEffect(() => {
    const handleSocketOrder = (newOrder) => {
      // Add new incoming order to the local state immediately
      setAllOrders((prev) => [newOrder, ...prev]);

      // If we're not on Pending tab, the badge will update automatically via useMemo
      if (filterStatus !== "Pending") {
        toast.info(`New Order from Table ${newOrder.tableNumber}`);
      }
    };

    socket.on("order_received", handleSocketOrder);
    return () => socket.off("order_received", handleSocketOrder);
  }, [filterStatus]);

  // --- 3. DYNAMIC FILTERING & COUNTS ---
  // This splits the main 'allOrders' array into status-specific lists
  const ordersByStatus = useMemo(() => {
    return {
      Pending: allOrders.filter((o) => o.status === "Pending"),
      Accepted: allOrders.filter((o) => o.status === "Accepted"),
      Served: allOrders.filter((o) => o.status === "Served"),
    };
  }, [allOrders]);

  const currentTabOrders = ordersByStatus[filterStatus] || [];

  // --- 4. STATUS TRANSITION ---
  const onStatusChange = async (orderId, nextStatus) => {
    try {
      // Local Update for instant UI feedback
      setAllOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o)),
      );

      const response = await updateOrderAPI(orderId, nextStatus);
      if (response.success) {
        toast.success(`Order ${nextStatus}`);
      } else {
        toast.error(response.message || "Update failed");
        fetchAllOrders();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Update failed. Refreshing...");
      fetchAllOrders();
    }
  };

  const tabs = [
    { id: "Pending", label: "Pending", icon: Clock, color: "text-orange-500" },
    { id: "Accepted", label: "Accepted", icon: Coffee, color: "text-blue-500" },
    {
      id: "Served",
      label: "Served",
      icon: CheckCircle,
      color: "text-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10 font-sans text-slate-900 mb-40">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Kitchen <span className="text-orange-500">Dashboard</span>
            </h1>
            <p className="text-slate-500 font-medium tracking-tight">
              Live Session Management
            </p>
          </div>
          <button
            onClick={fetchAllOrders}
            className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all text-slate-400"
            title="Refresh Orders"
          >
            <Clock size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </header>

        {/* TAB NAVIGATION */}
        <div className="flex flex-wrap gap-3 mb-12 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filterStatus === tab.id;
            const count = ordersByStatus[tab.id]?.length || 0;

            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md scale-105"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} className={isActive ? tab.color : ""} />
                <span className="text-sm tracking-tight">{tab.label}</span>
                <span
                  className={`ml-1 text-[10px] px-2 py-0.5 rounded-lg font-black ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ORDERS GRID */}
        {loading && allOrders.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : currentTabOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <AlertCircle size={60} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">
              No {filterStatus.toLowerCase()} orders
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {currentTabOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusChange={onStatusChange}
                fetchAllOrders={fetchAllOrders}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrder;
