// File: backend/db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  if (db) return db;

  try {
    await client.connect();
    db = client.db("DraftZone");
    console.log("✅ MongoDB Connected (DraftZone)");
    return db;
  } catch (err) {
    // Do NOT kill the process here. connectDB() is called unawaited at startup,
    // so exiting on a Mongo failure took down the whole API several seconds
    // after it began serving — including /api/players/fetch and /api/odds,
    // which are served from external APIs and need no database at all.
    // Leave `db` unset: getDB() still throws for routes that genuinely need
    // Mongo, and those routes fail individually instead of taking the server
    // down with them.
    console.error("❌ MongoDB Connection Error:", err.message);
    console.error("   Database routes will fail; player and odds endpoints are unaffected.");
    return null;
  }
}

function getDB() {
  if (!db) {
    throw new Error("⚠️ Database not initialized. Call connectDB() first.");
  }
  return db;
}

module.exports = { connectDB, getDB };