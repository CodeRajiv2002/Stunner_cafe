import React, { useState, useEffect } from "react";
import { fetchOrderHistory } from "../../utils/api";
import {
  Calendar,
  Clock,
  Hash,
  Utensils,
  RefreshCw,
  Filter,
  IndianRupee,
} from "lucide-react";

// Helper to format time (e.g., "3:04 PM")
const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Helper to format date (e.g., "31 Jan 2026")
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function OrdersHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("today");
  const [statusFilter, setStatusFilter] = useState("");

  const loadHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      // API call with timeRange and optional status
      const response = await fetchOrderHistory({
        timeRange,
        status: statusFilter || undefined,
      });
      if (response && response.orders) {
        setOrders(response.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to load history:", error.message || error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [timeRange, statusFilter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="flex flex-col h-full w-full space-y-4 font-sans pb-30">
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-100">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Order History
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Total Records: {orders.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-orange-100 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Served">Served</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 text-white border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="alltime">All Time</option>
          </select>

          <button
            onClick={loadHistory}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
          >
            <RefreshCw
              size={20}
              className={`${loading ? "animate-spin" : ""} text-slate-600`}
            />
          </button>
        </div>
      </div>

      {/* --- HISTORY TABLE --- */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 shadow-sm">
              <tr>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} /> Date & Time
                  </div>
                </th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Hash size={14} /> Table
                  </div>
                </th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Utensils size={14} /> Items Ordered
                  </div>
                </th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  <div className="flex items-center justify-end gap-1">
                    <IndianRupee size={12} /> Bill
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // Skeleton Loader or Loading State
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="p-8 bg-slate-50/30"></td>
                  </tr>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Date & Time */}
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {formatTime(order.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Table Number */}
                    <td className="p-5">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs border border-slate-200">
                        {order.tableNumber}
                      </div>
                    </td>

                    {/* Items List */}
                    <td className="p-5">
                      <div className="flex flex-wrap gap-2 max-w-md">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg"
                          >
                            <span className="text-[10px] font-black text-orange-500 uppercase">
                              {item.quantity}x
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.status === "Served"
                            ? "bg-green-100 text-green-600"
                            : order.status === "Cancelled"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="p-5 text-right">
                      <span className="text-sm font-black text-slate-900">
                        ₹{order.totalAmount}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty State
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Utensils size={64} />
                      <p className="font-black text-xl">
                        No orders found for this period
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrdersHistory;
