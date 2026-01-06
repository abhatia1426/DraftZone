const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

class Bet {
    static async create(betData) {
        const db = getDB();
        const bet = {
            userId: new ObjectId(betData.userId),
            gameId: betData.gameId,
            awayTeam: betData.awayTeam,
            homeTeam: betData.homeTeam,
            teamName: betData.teamName,
            betType: betData.betType,
            odds: betData.odds,
            amount: betData.amount,
            potentialPayout: betData.potentialPayout,
            profit: betData.profit,
            status: "pending",
            placedAt: new Date(),
            settledAt: null,
            result: null
        };

        const result = await db.collection("bets").insertOne(bet);
        return { ...bet, _id: result.insertedId };
    }

    static async findByUserId(userId, limit = 50) {
        const db = getDB();
        return await db.collection("bets")
            .find({ userId: new ObjectId(userId) })
            .sort({ placedAt: -1 })
            .limit(limit)
            .toArray();
    }

    static async findPendingByUserId(userId) {
        const db = getDB();
        return await db.collection(bets)
            .find({
                userId: new ObjectId(userId),
                status: "pending"
            })
            .sort({ placedAt: -1})
            .toArray();
    }

    static async findById(betId) {
        const db = getDB();
        return await db.collection("bets").findOne({ _id: new ObjectId(betId)});
    }

    static async settle(betId, status, result = null) {
        const db = getDB();
        return await db.collection("bets").updateOne(
            { _id: new ObjectId(betId) },
            {
                $set: {
                    status,
                    settledAt: new Date(),
                    result,
                }
            }
        );
    }

    static async getUserStats(userId) {
        const db = getDB();
        const stats = await db.collection("bets").aggregate([
            { $match: { userId: new ObjectId(userId)}},
            {
                $group: {
                    _id: "$status",
                    count : { $sum: 1 },
                    totalAmount: { $sum: "$amount" },
                    totalProfit: { $sum: "$profit" },
                }
            }
        ]).toArray();

        return stats;
    }
}

module.exports = Bet;