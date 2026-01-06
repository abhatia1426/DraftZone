const { connectDB, getDB } = require('./config/db');

async function listUsers() {
  await connectDB();
  const db = getDB();
  
  const users = await db.collection("users").find({}).toArray();
  
  console.log("📋 Users in database:");
  users.forEach(user => {
    console.log("\n---");
    console.log("ID:", user._id.toString());
    console.log("Email:", user.email);
    console.log("Balance:", user.balance || "NOT SET");
  });
  
  if (users.length === 0) {
    console.log("\n No users found! You need to create one.");
  }
  
  process.exit(0);
}

listUsers();