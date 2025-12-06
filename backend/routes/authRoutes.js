const express = require('express');
const router = express.Router();


// Mock Database of Sample accounts
const USERS = [
    {email: "admin@draftzone.com", password: "admin", role: "admin", name: "Commissioner" },
    {email: "user@draftzone.com", password: "user", role: "user", name: "Fantasy Manager"}
];


// Post api/auth/login
router.post('/login', (req, res) => {
    console.log(" Login Attempt Received!");
    console.log("Data Received: ", req.body);

    const { email, password } = req.body;

    const user = USERS.find(u =>
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if(user) {
        res.json({
            success: true,
            user: {
                email: user.email,
                role: user.role,
                name: user.name
            }
        });
    } else {
        console.log(" FAILURE: No matching user found.");
        res.status(401).json({success: false, message: "Invalid email or password. "});
    }
});

router.post('./signup', (req, res) => {
    const { email, password } = req.body;

    res.json ({
        success: true,
        user: {
            email: email,
            role: "user",
            name: "New User"
        }
    });
});

module.exports = router;