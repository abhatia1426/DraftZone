require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Import Routes
const oddsRoutes = require('./routes/odds');
const playerRoutes = require('./routes/playerRoutes');
const aiRoutes = require('./routes/aIRoutes');
const authRoutes = require('./routes/authRoutes');

// Use Routes
app.use('/api', oddsRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Server is RUNNING on http://localhost:${PORT}`);
  console.log("   (Keep this terminal open!)");
});

// Safety: Log if it crashes
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});