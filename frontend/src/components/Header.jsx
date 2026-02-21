import React, { useState, useEffect, useMemo } from "react";
import { Search, ShoppingCart, X } from "lucide-react";
import logo from "../assets/images/logo.jpg";
import { useCart } from "../hook/useCart";
import { Link } from "react-router-dom";
import { useMenu } from "../hook/useMenu";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBumped, setIsBumped] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { menu: menuItems } = useMenu();
  const { cart, dispatch } = useCart();

  // 1. Optimized Total Items Calculation
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  // 2. Fix: Cart animation side-effect
  useEffect(() => {
    if (totalItems === 0) return;

    const bumpTimer = setTimeout(() => setIsBumped(true), 0);
    const resetTimer = setTimeout(() => setIsBumped(false), 300);

    return () => {
      clearTimeout(bumpTimer);
      clearTimeout(resetTimer);
    };
  }, [totalItems]);

  // 3. Optimized Search Filtering with useMemo
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, menuItems]);

  const handleAddToCart = (item) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: item,
    });
    setSearchTerm("");
    setIsSearchOpen(false);
  };

  return (
    <>
      {/* HEADER */}
      <header className="bg-[#1a1a1a] p-3 md:p-4 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="w-16 md:w-24 shrink-0">
            <img src={logo} alt="Stunner Cafe Logo" className="rounded-lg" />
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <div className="flex items-center w-full h-11 bg-gray-100 rounded-xl px-3 border border-transparent focus-within:border-orange-200 transition-all">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ml-3 w-full bg-transparent focus:outline-none text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Desktop Search Results */}
            {searchTerm && (
              <div className="absolute top-12 left-0 w-full bg-white border rounded-xl shadow-xl z-40 max-h-80 overflow-y-auto">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div
                      key={item._id} // ✅ Using DB _id
                      className="flex items-center justify-between p-3 hover:bg-orange-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          className="h-10 w-10 rounded-md object-cover"
                          alt=""
                        />
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">₹{item.price}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className="rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-600 shadow-sm"
                      >
                        Add
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500 italic">
                    No dishes found for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <Search size={24} />
            </button>

            <Link to="/cart" className="relative group">
              <div
                className={`p-2 transition-all duration-300 ${
                  isBumped
                    ? "scale-125 text-orange-600"
                    : "text-gray-700 group-hover:text-orange-500"
                }`}
              >
                <ShoppingCart size={26} />

                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-md mx-auto mt-12 shadow-2xl animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-lg uppercase tracking-tight">
                Search Menu
              </h3>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchTerm("");
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative">
              <input
                autoFocus
                type="text"
                placeholder="What are you craving?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-2xl p-4 pr-12 focus:border-orange-500 focus:outline-none transition-all"
              />
              <Search className="absolute right-4 top-4 text-gray-300" />
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {searchTerm && filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div
                    key={item._id} // ✅ Using DB _id
                    className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        className="h-12 w-12 rounded-xl object-cover"
                        alt=""
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {item.name}
                        </p>
                        <p className="text-xs text-orange-500 font-bold">
                          ₹{item.price}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-white active:scale-95 transition-transform"
                    >
                      ADD
                    </button>
                  </div>
                ))
              ) : searchTerm ? (
                <p className="text-center py-8 text-sm text-gray-400 font-medium italic">
                  We couldn't find that dish... 🍕
                </p>
              ) : (
                <p className="text-center py-8 text-xs text-gray-300 uppercase font-bold tracking-widest">
                  Type to start searching
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
