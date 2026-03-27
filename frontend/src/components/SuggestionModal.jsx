import React, { useEffect } from "react";
import { X, Plus } from "lucide-react";
import { useSuggestion } from "../Context/SuggestionContext";
import { useCart } from "../hook/useCart";

const SuggestionModal = () => {
  const { suggestion, closeSuggestion } = useSuggestion();
  const { dispatch } = useCart();

  // Auto-close after 8 seconds
  useEffect(() => {
    if (suggestion.isOpen) {
      const timer = setTimeout(() => {
        closeSuggestion();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [suggestion.isOpen, closeSuggestion]);

  if (!suggestion.isOpen) return null;

  const handleAddToCart = (item) => {
    dispatch({ type: "ADD_TO_CART", payload: item });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl w-full sm:max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 max-h-[90vh] sm:max-h-auto overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-orange-500 to-red-500 p-3 sm:p-5 sticky top-0">
          <h2 className="text-white font-black text-base sm:text-lg text-center">
            ✨ Perfect Pairs!
          </h2>
          <p className="text-orange-50 text-[10px] sm:text-xs text-center font-medium mt-1 line-clamp-2">
            Customers who bought {suggestion.triggeredBy?.name} also loved these
          </p>
          <button
            onClick={closeSuggestion}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} className="text-white sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Suggestions Grid */}
        <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
          {suggestion.items.length > 0 ? (
            <>
              {suggestion.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-orange-50 rounded-xl sm:rounded-2xl hover:bg-orange-100 transition-colors border border-orange-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-orange-600 font-bold text-base sm:text-lg">
                      ₹{item.price}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="ml-2 sm:ml-3 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all active:scale-95 shadow-lg shrink-0"
                  >
                    <Plus size={18} className="sm:w-5 sm:h-5" strokeWidth={3} />
                  </button>
                </div>
              ))}

              {/* Auto-close Timer */}
              {/* <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-orange-200">
                <p className="text-[10px] sm:text-xs text-gray-400 text-center font-medium">
                  Modal closes automatically in 8 seconds
                </p>
              </div> */}
            </>
          ) : (
            <p className="text-center text-gray-500 py-4 sm:py-6">
              No suggestions available
            </p>
          )}
        </div>

        {/* Close Button */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t sticky bottom-0">
          <button
            onClick={closeSuggestion}
            className="w-full py-2 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionModal;
