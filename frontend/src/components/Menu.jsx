import { useState, useMemo, useEffect, useCallback } from "react";
import { useMenu } from "../hook/useMenu";
import ItemCart from "./ItemCart";
import { useSearchParams } from "react-router-dom";
import { socket } from "../socket";
import { toast } from "sonner";
import { toggleTableStatus } from "../utils/api";

function Menu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const { menu: menuItems, loading } = useMenu();
  const [searchParams] = useSearchParams();

  // --- 1. NOTIFICATION LOGIC ---
  useEffect(() => {
    const tableNumber = localStorage.getItem("stunner_table_number");

    if (tableNumber) {
      // Join the specific room for this table
      socket.emit("join_room", `table_${tableNumber}`);
    }

    const handleStatusUpdate = (data) => {
      // Play a notification sound
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      );
      audio.play().catch(() => {});

      // Map statuses to user-friendly messages
      const statusMessages = {
        Accepted: "👨‍🍳 Your order has been accepted and is being prepared!",
        Served: "🍽️ Your order is on its way to your table!",
        Cancelled: "❌ Sorry, your order was cancelled. Please contact staff.",
      };

      const message =
        statusMessages[data.status] ||
        `Your order status is now: ${data.status}`;

      toast.info(message, {
        duration: 5000,
        position: "top-center",
      });
    };

    socket.on("order_status_updated", handleStatusUpdate);

    return () => {
      socket.off("order_status_updated", handleStatusUpdate);
    };
  }, []);

  // --- EXISTING LOGIC ---
  const priceTiers = [100, 200, 300, 500];

  const maxMenuPrice = useMemo(() => {
    return menuItems.length > 0
      ? Math.max(...menuItems.map((item) => item.price))
      : 500;
  }, [menuItems]);

  const [priceLimit, setPriceLimit] = useState(maxMenuPrice);

  useEffect(() => {
    const table = searchParams.get("table");
    if (table) {
      localStorage.setItem("stunner_table_number", table);
      toggleTableStatus(table, "Occupied");
    }
  }, [searchParams]);

  const categories = useMemo(() => {
    const rawCategories = menuItems.map((item) => item.category);
    return ["All", ...new Set(rawCategories)];
  }, [menuItems]);

  const filteredItems = menuItems.filter((item) => {
    const hasImage = item.imageUrl && item.imageUrl !== "";
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesType = activeType === "All" || item.type === activeType;
    const matchesPrice = item.price <= priceLimit;
    return hasImage && matchesCategory && matchesType && matchesPrice;
  });

  const resetFilters = useCallback(() => {
    setActiveCategory("All");
    setActiveType("All");
    setPriceLimit(maxMenuPrice);
  }, [maxMenuPrice]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold animate-pulse">Loading Menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-10 px-4 sm:px-8 lg:px-16">
      <header className="mb-10 text-center">
        <h2 className="text-3xl font-bold uppercase tracking-widest text-orange-500">
          Menu
        </h2>
      </header>

      {/* Filter UI */}
      <div className="max-w-6xl mx-auto mb-12 flex flex-col gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                Budget Filter
              </span>
              <div className="flex flex-wrap gap-2">
                {priceTiers.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setPriceLimit(tier)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      priceLimit === tier
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-gray-100"
                    }`}
                  >
                    Under ₹{tier}
                  </button>
                ))}
                <button
                  onClick={() => setPriceLimit(maxMenuPrice)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    priceLimit === maxMenuPrice
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-600 border-gray-100"
                  }`}
                >
                  Any Price
                </button>
              </div>
            </div>

            <div className="hidden lg:block h-12 w-px bg-gray-100 mx-4"></div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                {["Veg", "Non-Veg", "All"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                      activeType === type
                        ? "bg-white shadow-sm text-orange-500"
                        : "text-gray-400"
                    }`}
                  >
                    {type === "All" ? "BOTH" : type.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={resetFilters}
                className="p-3 text-gray-400 hover:text-orange-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-2xl px-8 py-3 text-sm font-bold transition-all border-2 ${
                activeCategory === cat
                  ? "bg-orange-500 text-white border-orange-500 shadow-lg"
                  : "bg-white text-gray-500 border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <ItemCart
              key={item._id}
              item={item}
              imageUrl={item.imageUrl}
              itemName={item.name}
              price={item.price}
              type={item.type}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100 max-w-2xl mx-auto">
          <p className="text-gray-400 font-bold">
            No dishes match your filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 text-orange-500 font-black text-sm uppercase tracking-tighter"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

export default Menu;
