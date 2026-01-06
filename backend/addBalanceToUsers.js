const { connectDB, getDB } = require('./config/db');

async function addBalanceToUsers() {
  await connectDB();
  const db = getDB();
  
  const result = await db.collection("users").updateMany(
    {}, // Update all users
    { 
      $set: { 
        balance: 1000,
        totalWagered: 0,
        totalWon: 0 
      } 
    }
  );
  
  console.log(`✅ Updated ${result.modifiedCount} users with balance fields`);
  console.log("\n📋 Updated users:");
  
  const users = await db.collection("users").find({}).toArray();
  users.forEach(user => {
    console.log(`\nID: ${user._id.toString()}`);
    console.log(`Email: ${user.email}`);
    console.log(`Balance: $${user.balance}`);
  });
  
  process.exit(0);
}

addBalanceToUsers();