// backend/models/User.js
const { getDB } = require("../config/db"); 

class User {
  // Check if user exists in DB
  static async findByEmail(email) {
    const db = getDB();
    return await db.collection("users").findOne({ email });
  }

  // Create new user in DB
  static async create(email, password, role = "user") {
    const db = getDB();
    return await db.collection("users").insertOne({
      email,
      password, // Hashed password
      role,
      createdAt: new Date(),
      balance: 1000,
      totalWagered: 0,
      totalWon: 0,
      createdAt: new Date()
    });
  }

  static async updateBalance(userId, newBalance) {
    const db = getDB();
    const { ObjectId } = require("mongodb");
    return await db.collection("users").updateOne(
      {_id: new ObjectId(userId)},
      { $set: { balance: newBalance}}
    );
  } 

  static async placeBet(userId, amount) {
    const db = getDB();
    const { ObjectId } = require("mongodb");
    return await db.collection("users").updateOne(
      {_id: new ObjectId(userIf)},
      {
        $inc: {
          balance: -amount,
          totalWagered: amount
        }
      }
    );
  }

  static async addWinnings(userId, payout, profit) {
    const db = getDB();
    const { ObjectId } = require("mongodb");
    return await db.collection("users").updateOne(
      {_id: new ObjectId(userId)},
      {
        $inc: {
          balance: payout,
          totalWon: profit
        }
      }
    );
  }
}

module.exports = User;a