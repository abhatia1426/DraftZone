const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

router.post('/suggest', async (req, res) => {
  const { roster, availablePlayers, round } = req.body;

  try {
    // Safety check: If no players, return error immediately
    if (!availablePlayers || availablePlayers.length === 0) {
        return res.json({ player: "Unknown", reason: "No players left." });
    }

    // Limit context to top 15 players to prevent timeouts
    const topPlayersList = availablePlayers
      .slice(0, 15)
      .map(p => `${p.full_name} (${p.position})`)
      .join(', ');

    const prompt = `
      Fantasy Football Draft. Round ${round}.
      My Needs: QB:${roster.QB?'OK':'Need'} RB:${roster.RB1&&roster.RB2?'OK':'Need'} WR:${roster.WR1&&roster.WR2?'OK':'Need'}
      Top Players: ${topPlayersList}
      Pick one best player.
      Output JSON ONLY: { "player": "Name", "reason": "Short reason" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Strip markdown
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const jsonResponse = JSON.parse(text);
      res.json(jsonResponse);
    } catch (e) {
      // If AI returns bad JSON, fallback to top player
      console.log("⚠️ AI Bad JSON, using fallback.");
      res.json({ player: availablePlayers[0].full_name, reason: "AI Format Error" });
    }

  } catch (error) {
    console.error(" AI Error:", error.message);
    // CRITICAL: Send a fallback response so Frontend doesn't hang
    if (availablePlayers && availablePlayers.length > 0) {
        res.json({ player: availablePlayers[0].full_name, reason: "Backend Error Fallback" });
    } else {
        res.status(500).json({ error: "AI Failed" });
    }
  }
});

module.exports = router;