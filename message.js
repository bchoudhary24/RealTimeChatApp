const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Save new message
router.post('/', async(req, res) => {
    const { sender, content, room } = req.body;
    try {
        const msg = await Message.create({ sender, content, room });
        res.json(msg);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all messages
router.get('/', async(req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
module.exports = router;