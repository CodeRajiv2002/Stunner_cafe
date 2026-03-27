import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [filter, setFilter] = useState("all"); // all, available, unavailable

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // Fetch all menu items
  useEffect(() => {
    fetchMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/menu/allitems`);
      if (res.data.success) {
        setMenuItems(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (itemId, currentStatus) => {
    setTogglingId(itemId);
    try {
      const res = await axios.patch(
        `${API_BASE}/menu/toggle-availability/${itemId}`,
      );

      if (res.data.success) {
        // Update local state
        setMenuItems((prev) =>
          prev.map((item) =>
            item._id === itemId
              ? { ...item, availability: !item.availability }
              : item,
          ),
        );

        const newStatus = !currentStatus ? "Available" : "Unavailable";
        toast.success(`${res.data.data.name} is now ${newStatus}`);
      }
    } catch (error) {
      console.error("Failed to toggle availability:", error);
      toast.error("Failed to update menu item");
    } finally {
      setTogglingId(null);
    }
  };

  // Filter menu items based on selected filter
  const filteredItems = menuItems.filter((item) => {
    if (filter === "available") return item.availability;
    if (filter === "unavailable") return !item.availability;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Menu Management
          </h1>
          <p className="text-gray-600">
            Toggle item availability to manage your menu
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "all"
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
            }`}
          >
            All Items ({menuItems.length})
          </button>
          <button
            onClick={() => setFilter("available")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "available"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:border-green-300"
            }`}
          >
            Available ({menuItems.filter((i) => i.availability).length})
          </button>
          <button
            onClick={() => setFilter("unavailable")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "unavailable"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:border-red-300"
            }`}
          >
            Unavailable ({menuItems.filter((i) => !i.availability).length})
          </button>
        </div>

        {/* Menu Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all ${
                  !item.availability ? "opacity-70 grayscale" : ""
                }`}
              >
                {/* Image Container */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Availability Badge */}
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
                      item.availability ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {item.availability ? "Available" : "Unavailable"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          item.type === "Veg"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-orange-600 font-bold text-lg">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mb-4">
                    Category:{" "}
                    <span className="font-semibold">{item.category}</span>
                  </p>

                  {/* Toggle Button */}
                  <button
                    onClick={() =>
                      toggleAvailability(item._id, item.availability)
                    }
                    disabled={togglingId === item._id}
                    className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      item.availability
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {togglingId === item._id ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      <>
                        {item.availability ? (
                          <>
                            <Eye size={16} />
                            <span>Make Unavailable</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={16} />
                            <span>Make Available</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500 text-lg">
              {filter === "all"
                ? "No menu items found"
                : `No ${filter} items found`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManagement;
