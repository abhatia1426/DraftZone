const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = "c6709c8e22b06473646f4aa845fef949";

router.get("/", async (req, res) => {
  try {
    const sport = "americanfootball_nfl";
    
    console.log("🏈 Fetching NFL odds..."); // Debug log

    const response = await axios.get(
      `https://api.the-odds-api.com/v4/sports/${sport}/odds`,
      {
        params: {
          apiKey: API_KEY,
          regions: "us",
          markets: "h2h,spreads,totals",
          oddsFormat: "american",
        },
      }
    );

    console.log(`Fetched ${response.data.length} games`);
    console.log("Remaining API requests:", response.headers["x-requests-remaining"]);
    
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching odds:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to fetch odds",
      details: error.response?.data || error.message 
    });
  }
});

module.exports = router;