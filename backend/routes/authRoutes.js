const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); 
const router = express.Router();


const USERS = [
    {email: "admin@draftzone.com", password: "admin", role: "admin", name: "Commissioner" },
    {email: "user@draftzone.com", password: "user", role: "user", name: "Fantasy Manager"}
];

// --- Basic brute-force protection ---
// In-memory per-email attempt tracker. Fine for a single-process demo app;
// would need a shared store (e.g. Redis) behind a real load balancer.
const loginAttempts = new Map(); // email -> { count, lockedUntil }
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 2 * 60 * 1000; // 2 minutes

const secondsLocked = (email) => {
    const record = loginAttempts.get(email.toLowerCase());
    if (record?.lockedUntil && record.lockedUntil > Date.now()) {
        return Math.ceil((record.lockedUntil - Date.now()) / 1000);
    }
    return 0;
};

const recordFailedAttempt = (email) => {
    const key = email.toLowerCase();
    const record = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
        record.lockedUntil = Date.now() + LOCK_DURATION_MS;
        record.count = 0;
    }
    loginAttempts.set(key, record);
};

const clearFailedAttempts = (email) => loginAttempts.delete(email.toLowerCase());

router.post('/login', async (req, res) => {
    console.log("🔑 Login Attempt:", req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const lockedFor = secondsLocked(email);
    if (lockedFor > 0) {
        return res.status(429).json({ success: false, message: `Too many failed attempts. Try again in ${lockedFor}s.` });
    }

    // 1. Check Hardcoded List
    const mockUser = USERS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (mockUser) {
        console.log(" Logged in via Hardcoded Account");
        clearFailedAttempts(email);

        // Demo accounts still need a real DB record so bets/balance have somewhere to live.
        let dbUser = await User.findByEmail(mockUser.email);
        if (!dbUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(mockUser.password, salt);
            const result = await User.create(mockUser.email, hashedPassword, mockUser.role);
            dbUser = { _id: result.insertedId };
        }

        return res.json({
            success: true,
            user: {
                _id: dbUser._id,
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
            recordFailedAttempt(email);
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, dbUser.password);
        if (!isMatch) {
            recordFailedAttempt(email);
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        clearFailedAttempts(email);
        console.log("Logged in via MongoDB");
        // RETURN OBJECT
        res.json({
            success: true,
            user: {
                _id: dbUser._id,
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

        if (password.length < 8 || !/\d/.test(password)) {
            return res.json({ success: false, message: "Password must be at least 8 characters and include a number." });
        }

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

        const result = await User.create(email, hashedPassword, validRole);

        console.log(` Created ${validRole} account`);
        res.json({
            success: true,
            user: {
                _id: result.insertedId,
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