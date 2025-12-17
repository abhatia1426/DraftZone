// draftRoutes.js
const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db'); // Import your DB helper

const router = express.Router();

// 1. Initialize a New Draft (POST /api/drafts)
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { gameMode } = req.body;

    const newDraft = {
      createdAt: new Date(),
      gameMode: gameMode || 'PVP',
      status: 'IN_PROGRESS',
      round: 1,
      turn: 1,
      picks: [], 
      rosters: {
        user1: { BENCH: [] },
        user2: { BENCH: [] }
      }
    };

    const result = await db.collection('drafts').insertOne(newDraft);
    res.json({ draftId: result.insertedId });
    console.log(`🏈 New Draft Started: ${result.insertedId}`);

  } catch (err) {
    console.error("Draft Init Error:", err);
    res.status(500).json({ error: "Failed to start draft" });
  }
});

// 2. Save a Pick (POST /api/drafts/:id/pick)
router.post('/:id/pick', async (req, res) => {
  try {
    const db = getDB();
    const draftId = req.params.id;
    const { player, user, round, turn, slot } = req.body;

    if (!ObjectId.isValid(draftId)) {
        return res.status(400).json({ error: "Invalid Draft ID" });
    }

    const updateQuery = {
      $push: { 
        picks: { 
          playerShort: player.full_name,
          playerId: player.player_id,
          user, 
          round, 
          slot,
          timestamp: new Date() 
        } 
      },
      $set: { 
        updatedAt: new Date(),
        currentRound: round,
        currentTurn: turn
      }
    };

    const rosterPath = `rosters.${user}`; 

    if (slot === 'BENCH') {
      updateQuery.$push[`${rosterPath}.BENCH`] = player;
    } else {
      updateQuery.$set[`${rosterPath}.${slot}`] = player;
    }

    await db.collection('drafts').updateOne(
      { _id: new ObjectId(draftId) },
      updateQuery
    );

    res.json({ success: true });

  } catch (err) {
    console.error("Save Pick Error:", err);
    res.status(500).json({ error: "Failed to save pick" });
  }
});

// 3. GET Single Draft (GET /api/drafts/:id)
// Useful to load a game or check details before deleting
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const draftId = req.params.id;

        if (!ObjectId.isValid(draftId)) {
            return res.status(400).json({ error: "Invalid Draft ID" });
        }

        const draft = await db.collection('drafts').findOne({ _id: new ObjectId(draftId) });

        if (!draft) {
            return res.status(404).json({ error: "Draft not found" });
        }

        res.json(draft);
    } catch (err) {
        console.error("Get Draft Error:", err);
        res.status(500).json({ error: "Failed to fetch draft" });
    }
});

// GET ALL Drafts (Limit to last 50 for performance)
router.get('/', async (req, res) => {
    try {
      const db = getDB();
      const drafts = await db.collection('drafts')
        .find({})
        .sort({ createdAt: -1 }) // Newest first
        .limit(50)
        .toArray();
      res.json(drafts);
    } catch (err) {
      console.error("Fetch All Drafts Error:", err);
      res.status(500).json({ error: "Failed to fetch drafts" });
    }
  });

// 4. UPDATE/FINISH Draft (PUT /api/drafts/:id/finish)
// Use this when the draft ends to save the final score and winner
router.put('/:id/finish', async (req, res) => {
    try {
        const db = getDB();
        const draftId = req.params.id;
        const { winner, score1, score2 } = req.body; // Expecting these from Frontend

        if (!ObjectId.isValid(draftId)) {
            return res.status(400).json({ error: "Invalid Draft ID" });
        }

        await db.collection('drafts').updateOne(
            { _id: new ObjectId(draftId) },
            {
                $set: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    results: {
                        winner,
                        score1,
                        score2
                    }
                }
            }
        );

        res.json({ message: "Draft completed successfully" });
        console.log(`🏁 Draft Finished: ${draftId}`);

    } catch (err) {
        console.error("Finish Draft Error:", err);
        res.status(500).json({ error: "Failed to finish draft" });
    }
});

// 5. DELETE Draft (DELETE /api/drafts/:id)
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();
        const draftId = req.params.id;

        if (!ObjectId.isValid(draftId)) {
            return res.status(400).json({ error: "Invalid Draft ID" });
        }

        const result = await db.collection('drafts').deleteOne({ _id: new ObjectId(draftId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Draft not found" });
        }

        res.json({ message: "Draft deleted successfully" });
        console.log(`🗑️ Draft Deleted: ${draftId}`);

    } catch (err) {
        console.error("Delete Draft Error:", err);
        res.status(500).json({ error: "Failed to delete draft" });
    }
});

//DELETE ALL (Add this to backend/routes/draftRoutes.js)
router.delete('/all/cleanup', async (req, res) => {
    const db = getDB();
    await db.collection('drafts').deleteMany({}); 
    res.json({ message: "Database Cleared" });
});



module.exports = router;