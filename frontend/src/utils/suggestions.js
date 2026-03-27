/**
 * Suggestion pairings for items
 * Maps item names to suggested item names that go well together
 */
export const suggestionMap = {
  "chilli chicken": ["garlic bread", "mango lassi", "french fries", "coke"],
  "paneer tikka": ["garlic bread", "mint lemonade", "naan", "salad"],
  "butter chicken": ["basmati rice", "naan", "mango lassi", "salad"],
  biryani: ["raita", "salad", "pickle", "coke"],
  "tandoori chicken": ["mint chutney", "onion", "lemon", "naan"],
  samosa: ["chutney", "tea", "aloo tikki", "lassi"],
  pizza: ["garlic bread", "salad", "coke", "ice cream"],
  pasta: ["garlic bread", "salad", "coke", "dessert"],
  burger: ["french fries", "coke", "milkshake", "ice cream"],
};

/**
 * Get suggestions for a given item
 * @param {string} itemName - The name of the item added to cart
 * @param {array} allMenuItems - All available menu items
 * @returns {array} Array of 4 suggested items or empty array
 */
export const getSuggestions = (itemName, allMenuItems) => {
  if (!itemName || !allMenuItems || allMenuItems.length === 0) {
    return [];
  }

  const itemNameLower = itemName.toLowerCase();
  const suggestedNames = suggestionMap[itemNameLower] || [];

  if (suggestedNames.length === 0) {
    // If no specific suggestions, return random items
    return allMenuItems
      .filter(
        (item) =>
          item.name.toLowerCase() !== itemNameLower &&
          item.availability !== false,
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }

  // Find menu items that match suggested names
  const suggestions = suggestedNames
    .map((suggestedName) =>
      allMenuItems.find(
        (item) =>
          item.name.toLowerCase().includes(suggestedName) &&
          item.availability !== false,
      ),
    )
    .filter(Boolean)
    .slice(0, 4);

  // If we don't have 4 suggestions, fill with random items
  if (suggestions.length < 4) {
    const remaining = allMenuItems
      .filter(
        (item) =>
          !suggestions.find((s) => s._id === item._id) &&
          item.name.toLowerCase() !== itemNameLower &&
          item.availability !== false,
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 4 - suggestions.length);

    suggestions.push(...remaining);
  }

  return suggestions;
};
