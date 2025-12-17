const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/fetch', async (req, res) => {
  console.log(" Fetching Players & 2025 Stats...");
  
  try {
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
          // CHANGE: Set rank to 400 so they appear AFTER top offensive players
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
          // Use real popularity rank, fallback to low priority
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

    // 3. Sort by Popularity (Stars first, Defenses middle, Bench last)
    allPlayersList.sort((a, b) => a.search_rank - b.search_rank);
    
    // 4. Send Top 1000
    const finalRoster = allPlayersList.slice(0, 1000);

    console.log(`Sending ${finalRoster.length} players sorted by rank.`);
    res.json(finalRoster);

  } catch (error) {
    console.error(" Error fetching from Sleeper:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;