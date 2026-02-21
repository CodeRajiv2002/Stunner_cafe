import React, { useMemo, useState } from "react";
import { markAsPaid, toggleTableStatus } from "../../utils/api";
import {
  CheckCircle,
  BellRing,
  ChefHat,
  AlertCircle,
  IndianRupee,
  XCircle,
  Check,
  CreditCard,
  RefreshCw,
} from "lucide-react";

/**
 * OrderCard Standalone Component
 * @param {Object} order - The order object containing tableNumber, status, items, etc.
 * @param {Function} onStatusChange - Function to handle status transitions
 * @param {Function} fetchAllOrders - Function to refresh the parent component's orders list
 */
const OrderCard = ({ order, onStatusChange, fetchAllOrders }) => {
  const [isPaying, setIsPaying] = useState(false);

  const displayDateTime = useMemo(() => {
    const rawDate = order.orderTime || order.createdAt;
    if (!rawDate) return "Just now";
    const dateObj = new Date(rawDate);
    return dateObj.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, [order.orderTime, order.createdAt]);

  // --- PAYMENT HANDLER ---
  const handlePaymentUpdate = async () => {
    const confirmed = window.confirm(
      `Confirm payment of ₹${order.totalAmount} for Table ${order.tableNumber}?`,
    );

    if (confirmed) {
      setIsPaying(true);
      try {
        // 1. Mark the order as paid in the database
        await markAsPaid(order._id, "Paid");

        // 2. Automatically set the table status back to "Available"
        // Note: Ensure your toggleTableStatus utility is imported
        await toggleTableStatus(order.tableNumber, "Available");

        // 3. Refresh the UI to reflect both payment and table status changes
        if (fetchAllOrders) await fetchAllOrders();

        console.log(`Table ${order.tableNumber} is now available.`);
      } catch (err) {
        console.error("Payment or Table Update failed:", err);
        alert("Action failed. Please check your connection.");
      } finally {
        setIsPaying(false);
      }
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Pending":
        return {
          headerColor: "bg-orange-500",
          Icon: BellRing,
          isPending: true,
        };
      case "Accepted":
        return {
          headerColor: "bg-blue-600",
          btnText: "Mark as Served",
          btnColor:
            "bg-green-600 hover:bg-green-700 shadow-green-100 text-white",
          nextStatus: "Served",
          Icon: ChefHat,
        };
      case "Served":
        return {
          headerColor: "bg-green-600",
          btnText: "Order Served",
          btnColor: "bg-slate-100 text-slate-400 cursor-not-allowed",
          nextStatus: null,
          Icon: CheckCircle,
          isServed: true,
        };
      case "Cancelled":
        return {
          headerColor: "bg-red-500",
          btnText: "Cancelled",
          btnColor: "bg-red-50 text-red-500 cursor-not-allowed",
          nextStatus: null,
          Icon: AlertCircle,
        };
      default:
        return {
          headerColor: "bg-slate-900",
          btnText: "Unknown",
          btnColor: "bg-gray-200 text-gray-500",
          nextStatus: null,
          Icon: AlertCircle,
        };
    }
  };

  const config = getStatusConfig(order.status);

  // --- HANDLERS ---
  const handleCancel = () => {
    const confirmed = window.confirm(
      `Are you sure you want to CANCEL the order for Table ${order.tableNumber}?`,
    );
    if (confirmed) {
      onStatusChange(order._id, "Cancelled");
    }
  };

  const handleAccept = () => {
    onStatusChange(order._id, "Accepted");
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col transition-all hover:shadow-2xl h-full group">
      {/* CARD HEADER */}
      <div
        className={`p-6 ${config.headerColor} text-white flex justify-between items-center transition-colors duration-500`}
      >
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block mb-1">
            Status: {order.status || "New"}
          </span>
          <h4 className="text-2xl font-black tracking-tight">
            Table {order.tableNumber}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block mb-1">
            Placed At
          </span>
          <p className="text-sm font-mono font-bold bg-white/20 px-2 py-1 rounded-lg">
            {displayDateTime}
          </p>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-4 mb-6">
          {order.items?.map((item, idx) => (
            <div
              key={item._id || idx}
              className="flex justify-between items-start gap-4"
            >
              <div className="flex gap-3">
                <span className="bg-slate-100 text-slate-900 font-bold px-2 py-1 rounded-xl text-xs flex items-center h-fit">
                  {item.quantity}x
                </span>
                <div>
                  <p className="font-bold text-slate-800 leading-tight">
                    {item.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {item.category || "General"}
                  </p>
                </div>
              </div>
              <p className="font-bold text-slate-600 text-sm whitespace-nowrap">
                ₹{item.price * item.quantity}
              </p>
            </div>
          ))}
        </div>

        {/* TOTAL AMOUNT & PAYMENT STATUS */}
        <div className="mt-auto pt-4 border-t-2 border-dashed border-slate-100">
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                Total Amount
              </span>
              <span className="text-2xl font-black text-slate-900 flex items-center tracking-tighter">
                <IndianRupee size={20} strokeWidth={3} /> {order.totalAmount}
              </span>
            </div>

            {/* PAYMENT STATUS BADGE */}
            <div className="flex flex-col items-end">
              <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">
                Payment
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                  order.paymentStatus === "Paid"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-500"
                }`}
              >
                {order.paymentStatus || "Unpaid"}
              </span>
            </div>
          </div>
          <span className="text-[8px] text-slate-300 font-mono tracking-tighter uppercase">
            ID: {order.deviceId?.slice(-6)}
          </span>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="px-6 pb-6 mt-auto">
        {config.isPending ? (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 shadow-sm"
            >
              <XCircle size={18} /> Cancel
            </button>
            <button
              onClick={handleAccept}
              className="flex-[1.5] py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100"
            >
              <Check size={18} strokeWidth={3} /> Accept
            </button>
          </div>
        ) : config.isServed && order.paymentStatus === "Unpaid" ? (
          <button
            onClick={handlePaymentUpdate}
            disabled={isPaying}
            className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-black shadow-lg disabled:opacity-70"
          >
            {isPaying ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <CreditCard size={18} />
            )}
            {isPaying ? "Processing..." : "Mark as Paid"}
          </button>
        ) : (
          <button
            disabled={!config.nextStatus}
            onClick={() =>
              config.nextStatus && onStatusChange(order._id, config.nextStatus)
            }
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 group shadow-lg ${config.btnColor}`}
          >
            <config.Icon
              size={18}
              className={config.nextStatus ? "group-hover:animate-bounce" : ""}
            />
            {config.btnText}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
