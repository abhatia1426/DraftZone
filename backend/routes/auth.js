const express = require("express");
const router = express.Router();

const USERS = {
  admin: { password: "admin123", role: "admin" },
  user: { password: "1234", role: "user" }
};

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!USERS[username] || USERS[username].password !== password) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  return res.json({
    success: true,
    role: USERS[username].role
  });
});

module.exports = router;
