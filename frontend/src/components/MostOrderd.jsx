import React, { useMemo } from "react";
import ItemCart from "./ItemCart";

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const MostOrdered = ({ menuItems }) => {
  const mostReorderedItems = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return [];

    // Only pick items with valid images
    const validItems = menuItems.filter(
      (item) => item.imageUrl && item.imageUrl !== "",
    );

    // Shuffle the array and pick the top 10
    const shuffled = shuffleArray(validItems);
    return shuffled.slice(0, 10);
  }, [menuItems]);

  // Don't render anything if there are no items
  if (mostReorderedItems.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto mb-10">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
        <h3 className="text-lg md:text-2xl font-black text-gray-800 tracking-tight">
          Most Re-ordered
        </h3>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto gap-3 sm:gap-5  scrollbar-hide px-4 sm:mx-0 sm:px-0 snap-x">
        {mostReorderedItems.map((item) => (
          <div
            key={`reorder-${item._id}`}
            className="w-37.5 sm:w-55 lg:w-62.5 shrink-0 snap-start"
          >
            <ItemCart
              item={item}
              imageUrl={item.imageUrl}
              itemName={item.name}
              price={item.price}
              type={item.type}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MostOrdered;
