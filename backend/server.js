require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

connectDB();

// Import Routes
const playerRoutes = require('./routes/playerRoutes');
const aiRoutes = require('./routes/aIRoutes');
const authRoutes = require('./routes/authRoutes');
const oddsRoutes = require('./routes/odds'); 
const draftRoutes = require('./routes/draftRoutes');
const betRoutes = require('./routes/betRoutes');

console.log('Odds routes loaded:', typeof oddsRoutes); // DEBUG LOG

// Use Routes
app.use('/api/players', playerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/odds', oddsRoutes); 
app.use('/api/drafts', draftRoutes);
app.use('/api/bets', betRoutes);

// Test route to verify routing works
app.get('/api/test', (req, res) => {
  console.log('✅ Test route hit!');
  res.json({ message: 'Test route works!' });
});

console.log('Routes registered. Test: http://localhost:8080/api/odds'); // DEBUG LOG

// Test Route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Server is RUNNING on http://localhost:${PORT}`);
  console.log("   (Keep this terminal open!)");
  console.log("🏈 Odds endpoint: http://localhost:" + PORT + "/api/odds"); // More visible log
});

// Safety: Log if it crashes
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});