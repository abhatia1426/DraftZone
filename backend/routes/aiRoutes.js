const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

router.post('/chat', async (req, res) => {
  const { message, context } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const { round, turn, roster, bench, topAvailable } = context || {};

    const prompt = `
      You are a sharp, concise fantasy football draft assistant helping a user live during their draft.
      Keep answers to 2-3 sentences, no markdown formatting.

      Current round: ${round ?? '?'}
      My roster: ${roster || 'Empty'}
      My bench: ${bench || 'None'}
      Top available players: ${topAvailable || 'Unknown'}

      User question: ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text().trim();

    res.json({ reply });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ reply: "Scout's offline right now — try again in a moment." });
  }
});

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

router.post('/recap', async (req, res) => {
  const { rosters, scores } = req.body;

  const summarizeRoster = (roster) =>
    ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX', 'DST', 'K']
      .map((k) => roster?.[k]?.full_name)
      .filter(Boolean)
      .join(', ') || 'Empty roster';

  try {
    const prompt = `
      You are a fantasy football draft analyst. Grade the Human team's draft on a letter scale (A+ through F) based on roster construction, positional balance, and total projected points versus their opponent.

      Human roster: ${summarizeRoster(rosters?.user1)}
      Human projected points: ${scores?.score1 ?? '?'}
      CPU roster: ${summarizeRoster(rosters?.user2)}
      CPU projected points: ${scores?.score2 ?? '?'}

      Output JSON ONLY: { "grade": "B+", "summary": "2-3 sentence summary of the human's draft strategy, strengths, and weaknesses." }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      res.json(JSON.parse(text));
    } catch {
      res.json({ grade: '—', summary: text });
    }
  } catch (error) {
    console.error('AI Recap Error:', error.message);
    res.status(500).json({ grade: '—', summary: "Scout couldn't grade this draft right now." });
  }
});

module.exports = router;