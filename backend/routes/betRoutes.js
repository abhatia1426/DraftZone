const express = require("express");
const router = express.Router();
const Bet = require("../models/Bet");
const User = require("../models/User");

//Post - Place a new bet
router.post("/", async (req, res) => {
    const { userId, gameId, awayTeam, homeTeam, teamName, betType, odds, amount } = req.body;

    console.log("Received bet request for userId", userId);

    try {
        if(!userId || !gameId || !teamName || !betType || !odds || !amount) {
            return res.status(400).json({ error: "Missing required fields"});
        }

        if(amount < 1) {
            return res.status(400).json({error: "Minimum bet amount is $1"});
        }

        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ error: "User not found"});
        }

        if(user.balance < amount) {
            return res.status(400).json({
                error: "Insufficient balance",
                currentBalance: user.balance,
                required: amount
            });
        }

        let potentialPayout;
        if(odds > 0) {
            potentialPayout = amount + (amount * (odds / 100));
        } else {
            potentialPayout = amount + (amount / (Math.abs(odds) / 100));
        }
        const profit = potentialPayout - amount;

        await User.placeBet(userId, amount);

        const newBet = await Bet.create({
            userId,
            gameId,
            awayTeam,
            homeTeam,
            teamName,
            betType,
            odds,
            amount,
            potentialPayout: parseFloat(potentialPayout.toFixed(2)),
            profit: parseFloat(profit.toFixed(2))
        });

        const updatedUser = await User.findById(userId);

        res.json({
            success: true,
            message: "Bet Placed Successfully!",
            newBet,
            newBalance: updatedUser.balance
        });

    } catch(error) {
        console.error("Error placing your bet: ", error);
        res.status(500).json({ error: "Failed to place bet", details: error.message});
    }
});

//GET - Get users bet history
router.get("/user/:userId", async (req, res) => {
    try {
        const bets = await Bet.findByUserId(req.params.userId);
        res.json(bets);
    } catch(error) {
        console.error("Error fetching bets: ", error);
        res.status(500).json({error: "Failed to fetch bets"});
    }
});

//Get - Get users pending bets
router.get("/pending/:userId", async (req, res) => {
    try{
        const bets = await Bet.findPendingByUserId(req.params.userId);
        res.json(bets);
    } catch (error) {
        console.error("Error fetching pending bets: ", error);
        res.status(500).json({ error: "Failed to fetch pending bets "});
    }
});

// GET - Get user betting statistics
router.get("/stats/:userId", async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if(!user) {
            return res.status(404).json({
                error: "User not found",
                balance: 1000,
                totalWagered: 0,
                totalWon: 0,
                bets: []
            });
        }
        const stats = await Bet.getUserStats(req.params.userId);
        res.json({
            balance: user.balance,
            totalWagered: user.totalWagered,
            totalWon: user.totalWon,
            bets: stats
        });
    } catch (error) {
        console.error("Error receiving user stats: ", error);
        res.status(500).json({ error: "Failed to fetch user statistics"});
    }
});

// PATCH - Settle a bet (Admin only)
router.patch("/:betId/settle", async (req, res) => {
    const { status, result } = req.body;

    try {
        const bet = await Bet.findById(req.params.betId);
        if(!bet) {
            return res.status(404).json({ error: "Bet not found"});
        }

        if(bet.status !== "pending") {
            return res.status(400).json({ error: "Bet already settled"});
        }

        await Bet.settle(req.params.betId, status, result);

        if(status === "won") {
            await User.addWinnings(bet.userId.toString(), bet.potentialPayout, bet.profit);
        }

        res.json({ success: true, message: 'Bet ${status}' });
    } catch (error) {
        console.error("Error settling bet: ", error);
        res.status(500).json({ error: "Failed to settle bet"});
    }
});

module.exports = router;