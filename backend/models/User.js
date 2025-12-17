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
      createdAt: new Date()
    });
  }
}

module.exports = User;