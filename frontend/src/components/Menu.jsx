import { useState, useMemo, useEffect, useCallback } from "react";
import { useMenu } from "../hook/useMenu";
import ItemCart from "./ItemCart";
import { useSearchParams } from "react-router-dom";
import { socket } from "../socket";
import { toast } from "sonner";
import { toggleTableStatus } from "../utils/api";
import MostOrdered from "./MostOrderd";
import SuggestionModal from "./SuggestionModal";

// --- Custom Icon Components ---
const VegIcon = () => (
  <div className="w-4 h-4 border-[1.5px] border-green-600 rounded-[3px] flex items-center justify-center mr-2 shrink">
    <div className="w-2 h-2 rounded-full bg-green-600"></div>
  </div>
);

const NonVegIcon = () => (
  <div className="w-4 h-4 border-[1.5px] border-red-800 rounded-[3px] flex items-center justify-center mr-2 shrink">
    <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-7 border-b-red-800"></div>
  </div>
);

function Menu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const { menu: menuItems, loading } = useMenu();
  const [searchParams] = useSearchParams();

  // --- Modal State ---
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // --- Notification Logic ---
  useEffect(() => {
    const tableNumber = localStorage.getItem("stunner_table_number");
    if (tableNumber) {
      socket.emit("join_room", `table_${tableNumber}`);
    }
    const handleStatusUpdate = (data) => {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      );
      audio.play().catch(() => {});
      const statusMessages = {
        Accepted: "👨‍🍳 Your order has been accepted!",
        Served: "🍽️ Your order is on its way!",
        Cancelled: "❌ Order cancelled. Please contact staff.",
      };
      toast.info(statusMessages[data.status] || `Status: ${data.status}`, {
        duration: 5000,
        position: "top-center",
      });
    };
    socket.on("order_status_updated", handleStatusUpdate);
    return () => socket.off("order_status_updated", handleStatusUpdate);
  }, []);

  const maxMenuPrice = useMemo(() => {
    return menuItems.length > 0
      ? Math.max(...menuItems.map((item) => item.price))
      : 500;
  }, [menuItems]);

  const [priceLimit, setPriceLimit] = useState(maxMenuPrice);

  // Set default price limit to max whenever menuItems first load
  useEffect(() => {
    setPriceLimit(maxMenuPrice);
  }, [maxMenuPrice]);

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
    <div className="min-h-screen bg-[#f6f6f6] py-4 px-4 sm:px-8 lg:px-16">
      <header className="mb-2 text-center">
        <h2 className="text-3xl font-bold uppercase tracking-widest text-orange-500">
          Menu
        </h2>
      </header>

      {/* Filter UI - Horizontal Scroll Row */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center gap-3 w-full">
          {/* Static Fixed Filters Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="shrink-0 flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Filters
            {(activeCategory !== "All" || priceLimit !== maxMenuPrice) && (
              <span className="ml-2 w-2 h-2 rounded-full bg-orange-500"></span>
            )}
          </button>

          {/* Scrollable Container for the rest of the buttons */}
          <div className="flex flex-1 overflow-x-auto scrollbar-hide gap-3 pb-1 items-center">
            {/* Veg Filter */}
            <button
              onClick={() =>
                setActiveType(activeType === "Veg" ? "All" : "Veg")
              }
              className={`shrink-0 flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium transition-all shadow-sm ${
                activeType === "Veg"
                  ? "border-green-600 bg-green-50 text-green-800"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <VegIcon />
              Veg
            </button>

            {/* Non-Veg Filter */}
            <button
              onClick={() =>
                setActiveType(activeType === "Non-Veg" ? "All" : "Non-Veg")
              }
              className={`shrink-0 flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium transition-all shadow-sm ${
                activeType === "Non-Veg"
                  ? "border-red-700 bg-red-50 text-red-800"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <NonVegIcon />
              Non-veg
            </button>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="shrink-0 flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5 text-gray-400"
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
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* most ordered items section */}
      <MostOrdered menuItems={menuItems} />

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

      {/* FILTER MODAL */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in-90">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-bold text-lg sm:text-xl text-gray-800">
                Filters
              </h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-6 sm:gap-8">
              {/* Budget Range Selector inside Modal */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-xs sm:text-sm">
                    Price Range
                  </h4>
                  <span className="text-orange-600 font-bold text-sm bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                    Under ₹{priceLimit}
                  </span>
                </div>

                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max={maxMenuPrice}
                    step="10"
                    value={priceLimit}
                    onChange={(e) => setPriceLimit(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase">
                    <span>₹0</span>
                    <span>₹{maxMenuPrice}</span>
                  </div>
                </div>
              </div>

              {/* Cuisine/Category Filter inside Modal */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3 sm:mb-4 uppercase tracking-wider text-xs sm:text-sm">
                  Cuisines & Categories
                </h4>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                        activeCategory === cat
                          ? "bg-red-500 text-white border-red-500 shadow-md"
                          : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t flex gap-3 sm:gap-4 bg-white sticky bottom-0">
              <button
                onClick={() => {
                  resetFilters();
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-2 sm:py-3 text-sm sm:text-base text-red-500 font-bold hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="flex-1 py-2 sm:py-3 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white rounded-lg sm:rounded-xl font-bold shadow-md transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestion Modal */}
      <SuggestionModal />
    </div>
  );
}

export default Menu;
