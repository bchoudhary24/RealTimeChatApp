const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register
router.post('https://realtimechatapp-b70g.onrender.com/register', async(req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ error: 'User already exists' });

        const newUser = await User.create({ username, password });
        res.json({ success: true, user: newUser });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('https://realtimechatapp-b70g.onrender.com/login', async(req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ success: true, token, user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
