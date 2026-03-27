import Menu from "../api/models/menu.model.js";
import menuData from "../public/data/menu.cleaned.js";

/**
 * Seeds the menu only if the collection is empty.
 * In Production, this prevents accidental data loss.
 */
export const seedMenu = async () => {
  try {
    const count = await Menu.countDocuments();

    if (count === 0) {
      console.log("🌱 Database empty. Initializing Stunner Cafe Menu...");
      await Menu.insertMany(menuData);
      console.log(`✅ Successfully seeded ${menuData.length} items!`);
    } else {
      console.log("ℹ️  Menu already exists. Skipping seed.");
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  }
};
