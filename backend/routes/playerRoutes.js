const express = require('express');
const axios = require('axios');
const { getDB } = require('../config/db'); // <--- 1. Import Database Helper
const router = express.Router();

router.get('/fetch', async (req, res) => {
  const db = getDB(); // <--- 2. Get DB Connection
  const forceRefresh = req.query.refresh === 'true'; // Allow forcing update via ?refresh=true

  try {
    // --- 3. CHECK MONGODB FIRST (The Cache Layer) ---
    if (!forceRefresh) {
      const cachedPlayers = await db.collection('players')
        .find({})
        .sort({ search_rank: 1 }) // Ensure they come out sorted
        .limit(1000)
        .toArray();

      if (cachedPlayers.length > 0) {
        console.log(`✅ Returning ${cachedPlayers.length} players from MongoDB Cache`);
        return res.json(cachedPlayers);
      }
    }

    console.log("☁️  Fetching Fresh Data from Sleeper API...");
    
    // --- EXTERNAL API CALLS (Your existing logic) ---
    const [playersRes, statsRes] = await Promise.all([
      axios.get('https://api.sleeper.app/v1/players/nfl'),
      axios.get('https://api.sleeper.app/v1/stats/nfl/regular/2025') 
    ]);

    const playersData = playersRes.data;
    const statsData = statsRes.data;

    let allPlayersList = [];

    Object.values(playersData).forEach(player => {
      const playerStats = statsData[player.player_id] || {};

      // Logic for Defenses
      if (player.position === 'DEF') {
        allPlayersList.push({
          player_id: player.player_id,
          full_name: `${player.first_name} ${player.last_name}`,
          position: 'DEF',
          team: player.player_id,
          search_rank: 400, 
          stats: {
            pts_ppr: playerStats.pts_ppr || 0,
            sack: playerStats.sack || 0,
            int: playerStats.int || 0,
            fum_rec: playerStats.fum_rec || 0,
            pts_allow: playerStats.pts_allow || 0
          }
        });
      } 
      // Logic for Offensive Players
      else if (player.active && ['QB', 'RB', 'WR', 'TE', 'K'].includes(player.position)) {
        allPlayersList.push({
          player_id: player.player_id,
          full_name: player.full_name,
          position: player.position,
          team: player.team || 'FA',
          search_rank: player.search_rank || 99999,
          stats: {
            pts_ppr: playerStats.pts_ppr || 0,
            pass_yd: playerStats.pass_yd || 0,
            pass_td: playerStats.pass_td || 0,
            rush_yd: playerStats.rush_yd || 0,
            rush_td: playerStats.rush_td || 0,
            rec_yd: playerStats.rec_yd || 0,
            rec_td: playerStats.rec_td || 0,
            rec: playerStats.rec || 0
          }
        });
      }
    });

    // Sort by Popularity
    allPlayersList.sort((a, b) => a.search_rank - b.search_rank);
    
    // Send Top 1000
    const finalRoster = allPlayersList.slice(0, 1000);

    // --- 4. SAVE TO MONGODB (The Write Layer) ---
    if (finalRoster.length > 0) {
      console.log("💾 Caching data to MongoDB...");
      
      // Clear old cache first so we don't have duplicates
      await db.collection('players').deleteMany({}); 
      
      // Insert the new list
      await db.collection('players').insertMany(finalRoster);
    }

    console.log(`🚀 Sending ${finalRoster.length} players (Fresh Fetch).`);
    res.json(finalRoster);

  } catch (error) {
    console.error("❌ Error fetching data:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;