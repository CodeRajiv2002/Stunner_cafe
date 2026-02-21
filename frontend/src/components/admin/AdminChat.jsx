import React, { useState, useEffect, useRef } from "react";
import { socket } from "../../socket";
import { Trash2, Send, RefreshCw, MessageSquare } from "lucide-react";
import {
  fetchTables,
  fetchActiveChats,
  clearChatHistory,
} from "../../utils/api";

const formatTime = (timeString) => {
  if (!timeString) return "";
  const date = new Date(`1970-01-01T${timeString}`);
  if (isNaN(date.getTime())) return timeString;
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

function AdminChat() {
  const [allTables, setAllTables] = useState([]);
  const [chats, setChats] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadTables, setUnreadTables] = useState(new Set());

  const scrollRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    const [tablesData, chatsData] = await Promise.all([
      fetchTables(),
      fetchActiveChats(),
    ]);
    setAllTables(tablesData || []);
    setChats(chatsData || {});
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await loadData();
    })();
    const interval = setInterval(async () => {
      const tables = await fetchTables();
      if (tables) setAllTables(tables);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      setChats((prev) => {
        const tableNum = msg.tableNumber;
        return {
          ...prev,
          [tableNum]: [...(prev[tableNum] || []), msg],
        };
      });
      if (msg.sender !== "staff" && selectedTable !== msg.tableNumber) {
        setUnreadTables((prev) => new Set(prev).add(msg.tableNumber));
      }
      if (selectedTable === msg.tableNumber) {
        setTimeout(
          () =>
            scrollRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            }),
          100,
        );
      }
    };
    socket.on("new_chat_message", handleNewMessage);
    return () => socket.off("new_chat_message", handleNewMessage);
  }, [selectedTable]);

  useEffect(() => {
    if (selectedTable) {
      scrollRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedTable, chats]);

  const handleSelectTable = (tNum) => {
    setSelectedTable(tNum);
    if (unreadTables.has(tNum)) {
      setUnreadTables((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tNum);
        return newSet;
      });
    }
  };

  const sendReply = (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedTable) return;
    socket.emit("staff_message", { text: reply, tableNumber: selectedTable });
    setReply("");
  };

  const handleClear = async () => {
    if (!window.confirm(`Delete all messages for Table ${selectedTable}?`))
      return;
    try {
      await clearChatHistory(selectedTable);
      setChats((prev) => {
        const updated = { ...prev };
        delete updated[selectedTable];
        return updated;
      });
      setUnreadTables((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedTable);
        return newSet;
      });
    } catch (error) {
      console.log(error);
      alert("Failed to delete messages");
    }
  };

  const sortedTables = [...allTables].sort((a, b) => {
    const aUnread = unreadTables.has(a.tableNumber);
    const bUnread = unreadTables.has(b.tableNumber);
    if (aUnread && !bUnread) return -1;
    if (!aUnread && bUnread) return 1;
    const aHasChat = chats[a.tableNumber]?.length > 0;
    const bHasChat = chats[b.tableNumber]?.length > 0;
    if (aHasChat && !bHasChat) return -1;
    if (!aHasChat && bHasChat) return 1;
    if (a.status === "Occupied" && b.status !== "Occupied") return -1;
    if (a.status !== "Occupied" && b.status === "Occupied") return 1;
    return a.tableNumber - b.tableNumber;
  });

  return (
    <div className="flex h-[calc(100vh-140px)] w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden font-sans mb-22">
      {/* ================= SIDEBAR (Left) ================= */}
      <div className="w-80 shrink-0 border-r border-slate-100 bg-slate-50/50 flex flex-col h-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
          <h3 className="font-black text-slate-800 text-lg tracking-tight">
            Messages
          </h3>
          <button
            onClick={loadData}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-orange-500 transition-all focus:outline-none"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedTables.map((table) => {
            const tNum = table.tableNumber;
            const tMsgs = chats[tNum] || [];
            const lastMsg = tMsgs[tMsgs.length - 1];
            const isOccupied = table.status === "Occupied";
            const isSelected = selectedTable === tNum;
            const hasUnread = unreadTables.has(tNum);

            return (
              <button
                key={table._id}
                onClick={() => handleSelectTable(tNum)}
                className={`w-full p-4 flex items-center gap-4 transition-all rounded-2xl border text-left group relative overflow-hidden focus:outline-none ${
                  isSelected
                    ? "bg-white border-orange-500 shadow-md ring-1 ring-orange-500"
                    : "bg-white border-slate-200 hover:border-orange-300 hover:shadow-sm"
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500" />
                )}
                <div
                  className={`relative h-12 w-12 rounded-2xl flex shrink-0 items-center justify-center font-black text-sm transition-all ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                      : "bg-slate-50 border border-slate-100 text-slate-600 group-hover:bg-orange-50 group-hover:text-orange-600"
                  }`}
                >
                  T{tNum}
                  {isOccupied && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <span
                      className={`font-bold text-sm ${isSelected ? "text-slate-800" : "text-slate-700"}`}
                    >
                      Table {tNum}
                    </span>
                    <div className="flex items-center gap-2">
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatTime(lastMsg.timestamp)}
                        </span>
                      )}
                      {hasUnread && (
                        <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-sm animate-pulse"></span>
                      )}
                    </div>
                  </div>
                  <p
                    className={`text-xs truncate ${isSelected ? "text-slate-500" : "text-slate-400"} ${hasUnread ? "font-bold text-slate-800" : ""}`}
                  >
                    {lastMsg ? (
                      lastMsg.sender === "staff" ? (
                        `You: ${lastMsg.text}`
                      ) : (
                        lastMsg.text
                      )
                    ) : (
                      <span className="italic opacity-50">No messages</span>
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= CHAT AREA (Right) ================= */}
      {/* flex-col + h-full + overflow-hidden is key. 
          It makes the right column exactly the height of the container. 
      */}
      <div className="flex-1 flex flex-col bg-white relative h-full min-w-0 overflow-hidden">
        {selectedTable ? (
          <>
            {/* Header: shrink-0 ensures it keeps its height */}
            <div className="h-20 px-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md shrink-0 z-20">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-lg">
                  {selectedTable}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-lg leading-tight">
                    Table {selectedTable}
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${allTables.find((t) => t.tableNumber === selectedTable)?.status === "Occupied" ? "bg-green-500" : "bg-slate-300"}`}
                    ></span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {allTables.find((t) => t.tableNumber === selectedTable)
                        ?.status || "Offline"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-xs uppercase focus:outline-none"
              >
                <Trash2 size={16} />
                <span>Clear Chat</span>
              </button>
            </div>

            {/* MESSAGES AREA: 
                flex-1: Take all remaining space.
                overflow-y-auto: Scroll inside this section.
                min-h-0: Essential for flexbox scrolling to work.
            */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 min-h-0">
              {!chats[selectedTable] || chats[selectedTable].length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl">
                    <MessageSquare size={40} />
                  </div>
                  <p className="font-semibold">
                    Start a conversation with the guests.
                  </p>
                </div>
              ) : (
                chats[selectedTable].map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex w-full ${msg.sender === "staff" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] flex flex-col ${msg.sender === "staff" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                          msg.sender === "staff"
                            ? "bg-orange-500 text-white rounded-br-sm"
                            : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-semibold">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Area: shrink-0 ensures it stays at the bottom and never moves */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0 z-10">
              <form
                onSubmit={sendReply}
                className="flex items-center gap-2 bg-slate-50 p-2 rounded-[30px] border border-slate-200 focus-within:ring-2 focus-within:ring-orange-100 transition-all shadow-sm"
              >
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-700 font-medium placeholder:text-slate-400 text-sm"
                />
                <button
                  disabled={!reply.trim()}
                  className="p-3 bg-orange-500 text-white rounded-full shadow-md hover:bg-orange-600 disabled:opacity-50 transition-all active:scale-95 shrink-0 focus:outline-none"
                >
                  <Send size={18} strokeWidth={2.5} className="ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-6">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
              <MessageSquare size={40} className="text-slate-200" />
            </div>
            <p className="font-bold text-lg text-slate-400">
              Select a table to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminChat;
