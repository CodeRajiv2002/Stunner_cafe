import Table from "../api/models/table.model.js";

export const seedTables = async () => {
  try {
    // 1. Check existing tables
    const count = await Table.countDocuments();
    if (count > 0) {
      console.log("ℹ️  Tables already exist. Skipping seed.");
      return;
    }

    console.log("🪑 Seeding Tables...");

    // 2. Clear old data (Uncomment this line if you need to update existing tables!)
    // await Table.deleteMany({});

    // 3. Define Base URL
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const tables = [];

    // 4. Generate 10 Tables
    for (let i = 1; i <= 10; i++) {
      tables.push({
        tableNumber: i,
        capacity: 4, // ✅ Fixed capacity for all tables
        status: "Available",
        qrCodeUrl: `${clientUrl}?table=${i}`,
      });
    }

    // 5. Insert into DB
    await Table.insertMany(tables);
    console.log(
      `✅ Successfully added ${tables.length} tables with capacity 4!`,
    );
  } catch (error) {
    console.error("❌ Table Seeding Failed:", error.message);
  }
};
