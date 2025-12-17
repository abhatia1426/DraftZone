const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); 
const router = express.Router();


const USERS = [
    {email: "admin@draftzone.com", password: "admin", role: "admin", name: "Commissioner" },
    {email: "user@draftzone.com", password: "user", role: "user", name: "Fantasy Manager"}
];


router.post('/login', async (req, res) => {
    console.log("🔑 Login Attempt:", req.body.email);
    const { email, password } = req.body;

    // 1. Check Hardcoded List
    const mockUser = USERS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (mockUser) {
        console.log(" Logged in via Hardcoded Account");
        return res.json({
            success: true,
            user: {
                email: mockUser.email,
                role: mockUser.role,
                name: mockUser.name
            }
        });
    }

    // 2. Check MongoDB
    try {
        const dbUser = await User.findByEmail(email);

        if (!dbUser) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, dbUser.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        console.log("Logged in via MongoDB");
        // RETURN OBJECT
        res.json({
            success: true,
            user: {
                email: dbUser.email,
                role: dbUser.role,
                name: "Fantasy Manager"
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// --- SIGNUP ROUTE ---
router.post('/signup', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        
        if (!email || !password) return res.json({ success: false, message: "Missing fields" });
        
        // Check Hardcoded
        if (USERS.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.json({ success: false, message: "Reserved email." });
        }

        // Check DB
        if (await User.findByEmail(email)) {
            return res.json({ success: false, message: "User already exists" });
        }

        // Save
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const validRole = (role === 'admin') ? 'admin' : 'user';

        await User.create(email, hashedPassword, validRole);

        console.log(` Created ${validRole} account`);
        res.json({ 
            success: true, 
            user: {
                email: email,
                role: validRole,
                name: "New User"
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;