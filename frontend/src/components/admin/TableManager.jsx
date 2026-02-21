import React, { useState, useEffect } from "react";
import { fetchTables, resetTable as resetTableApi } from "../../utils/api";
import { LayoutGrid, RefreshCw, UserCheck, Unlock, Coffee } from "lucide-react";

function TableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTables = async () => {
    setLoading(true);
    const data = await fetchTables();
    if (data) setTables(data);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await loadTables();
    })();
    const interval = setInterval(loadTables, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleReset = async (tableNumber) => {
    if (window.confirm(`Manually reset Table ${tableNumber} to Available?`)) {
      await resetTableApi(tableNumber);
      loadTables(); // Refresh the grid
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 font-sans mb-26">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Floor Plan
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {tables.filter((t) => t.status === "Occupied").length} Tables
            Currently Active
          </p>
        </div>
        <button
          onClick={loadTables}
          className="p-3 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100"
        >
          <RefreshCw
            size={20}
            className={loading ? "animate-spin" : "text-slate-600"}
          />
        </button>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2">
        {tables.map((table) => {
          const isOccupied = table.status === "Occupied";

          return (
            <div
              key={table._id}
              className={`relative bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 flex flex-col items-center justify-center gap-4 ${
                isOccupied
                  ? "border-orange-500 shadow-xl shadow-orange-50"
                  : "border-slate-50 shadow-sm hover:border-slate-200"
              }`}
            >
              {/* Status Dot */}
              <div
                className={`absolute top-6 right-6 h-3 w-3 rounded-full ${isOccupied ? "bg-orange-500 animate-pulse" : "bg-slate-200"}`}
              />

              {/* Table Icon/Number */}
              <div
                className={`h-20 w-20 rounded-3xl flex items-center justify-center transition-colors ${
                  isOccupied
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                    : "bg-slate-50 text-slate-400"
                }`}
              >
                {isOccupied ? <Coffee size={32} /> : <LayoutGrid size={32} />}
              </div>

              <div className="text-center">
                <h3 className="text-xl font-black text-slate-800">
                  Table {table.tableNumber}
                </h3>
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${isOccupied ? "text-orange-500" : "text-slate-300"}`}
                >
                  {table.status}
                </p>
              </div>

              {/* Action Button */}
              {isOccupied ? (
                <button
                  onClick={() => handleReset(table.tableNumber)}
                  className="mt-2 w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
                >
                  <Unlock size={14} /> Make Available
                </button>
              ) : (
                <div className="mt-2 w-full py-3 bg-slate-50 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <UserCheck size={14} /> Ready for Guest
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TableManagement;
