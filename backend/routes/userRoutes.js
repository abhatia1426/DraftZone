const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET - list all users (admin)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH - set a user's balance (admin)
router.patch('/:id/balance', async (req, res) => {
  const { balance } = req.body;

  if (typeof balance !== 'number' || balance < 0) {
    return res.status(400).json({ error: 'Balance must be a non-negative number' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.updateBalance(req.params.id, balance);
    res.json({ success: true, balance });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

module.exports = router;
