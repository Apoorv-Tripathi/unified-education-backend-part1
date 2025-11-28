require("dotenv").config();
const mongoose = require("mongoose");

async function clearDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    for (let collection of collections) {
      await db.collection(collection.name).deleteMany({});
      console.log(`Cleared: ${collection.name}`);
    }

    console.log("🎉 All collections cleared!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

clearDB();