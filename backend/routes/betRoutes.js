const express = require("express");
const router = express.Router();
const bet = require("../models/Bet");
const User = require("../models/User");

//Post - Place a new bet
router.post("/", async (req, res) => {
    const { userId, gameId, awayTeam, homeTeam, teamName, betType, odds, amount } = req.body;

    try {
        if(!userId || !gameId || !teamName || !betType || !odds || !amount) {
            return res.status(400).json({ error: "Missing required fields"});
        }

        if(amount < 1) {
            return res.status(400).json({error: "Minimum bet amount is $1"});
        }

        const user = await User.findbyId(userId);
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

        const bet = await Bet.create({
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
            bet,
            newBalance: updatedUser.balance
        });

    } catch(error) {
        console.error("Error placing your bet: ", error);
        res.status(500).json({ error: "Failed to place bet", details: error.message});
    }
});

//GET - Get users bet history
