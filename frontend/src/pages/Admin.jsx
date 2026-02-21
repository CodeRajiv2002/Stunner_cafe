import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/admin/Sidebar";
import AdminOrder from "../components/admin/AdminOrder";
import AdminChat from "../components/admin/AdminChat";
import { socket } from "../socket";
import { toast } from "sonner";
import OrdersHistory from "../components/admin/OrdersHistory";
import TableManagement from "../components/admin/TableManager";

const Admin = () => {
  const [activeTab, setActiveTabRaw] = useState("new_orders");

  // Custom setter to reset badge counts when tab changes
  const setActiveTab = (tab) => {
    setActiveTabRaw(tab);
    if (tab === "new_orders") setNewOrdersCount(0);
    if (tab === "chats") setUnreadMessagesCount(0);
  };
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Notification States
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Ref to track active tab for socket closures
  const activeTabRef = useRef(activeTab);

  // --- 1. SYNC REF & RESET COUNTS ---
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // --- 2. AUDIO UNLOCKER ---
  const handleInteraction = () => {
    if (!audioUnlocked) {
      setAudioUnlocked(true);
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      );
      audio.volume = 0;
      audio.play().catch(() => {});
    }
  };

  // --- 3. SOCKET LISTENERS ---
  useEffect(() => {
    socket.emit("join_room", "staff_room");

    const handleNewOrder = (data) => {
      // Sound & Toast
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      );
      audio.play().catch(() => {});

      toast.info(`New Order: Table ${data.tableNumber} 🍽️`, {
        closeButton: true,
        duration: Infinity, // 🛑 Disable the timer
        dismissible: true, // Ensure the close button/swipe works
      });
      // Badge Logic: Increment only if NOT on the orders tab
      if (activeTabRef.current !== "new_orders") {
        setNewOrdersCount((prev) => prev + 1);
      }
    };

    const handleNewChat = (data) => {
      // Sound & Toast
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
      );
      audio.play().catch(() => {});
      toast.message(`New message from Table ${data.tableNumber} 💬`);

      // Badge Logic: Increment only if NOT on the chats tab
      if (activeTabRef.current !== "chats") {
        setUnreadMessagesCount((prev) => prev + 1);
      }
    };

    socket.on("order_received", handleNewOrder);
    socket.on("chat_notification", handleNewChat);

    return () => {
      socket.off("order_received", handleNewOrder);
      socket.off("chat_notification", handleNewChat);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "new_orders":
        return <AdminOrder />;
      case "chats":
        return <AdminChat />;
      case "tables":
        return <TableManagement />;
      case "history":
        return <OrdersHistory />;
      default:
        return <AdminOrder />;
    }
  };

  return (
    <div
      className="flex h-screen bg-gray-50 overflow-hidden font-sans"
      onClick={handleInteraction}
    >
      {/* Audio Unlock Overlay */}
      {!audioUnlocked && (
        <div className="fixed bottom-6 right-6 z-50 bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-black shadow-2xl animate-bounce cursor-pointer">
          🔔 Click to enable alerts
        </div>
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        // Pass counts to Sidebar for the badges
        counts={{
          orders: newOrdersCount,
          chats: unreadMessagesCount,
        }}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="p-6 border-b bg-white flex justify-between items-center">
          <h2 className="text-2xl font-black capitalize text-slate-800 tracking-tight">
            {activeTab.replace("_", " ")}
          </h2>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border">
            <span
              className={`h-2 w-2 rounded-full ${socket.connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            ></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {socket.connected ? "Live" : "Offline"}
            </span>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderContent()}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
