require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// ✅ Update Render backend domain below 👇
const CLIENT_ORIGIN = 'https://splendid-frangollo-6851e6.netlify.app';

// ✅ Configure CORS
app.use(cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// ✅ Serve static files (chat.html, etc.)
app.use(express.static(__dirname + '/public'));

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Initialize socket.io with CORS
const io = socketio(server, {
    cors: {
        origin: CLIENT_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// ✅ Temporary in-memory OTP store
const otpStore = {};

// ✅ Send OTP (demo)
app.post('/api/send-otp', (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const otp = 123456; // Demo fixed OTP
    otpStore[email] = otp;

    console.log('✅ OTP generated for', email, ':', otp);

    res.json({ success: true, otp });
});

// ✅ Verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ success: false, message: 'Missing email or code' });
    }

    if (otpStore[email] && otpStore[email].toString() === code) {
        delete otpStore[email]; // Clear used OTP
        return res.json({ success: true });
    }

    res.json({ success: false });
});

// ✅ Socket.io events
io.on('connection', (socket) => {
    console.log('🔌 New user connected');

    socket.on('join', ({ username, room }) => {
        socket.join(room);
        console.log(`👤 ${username} joined room: ${room}`);
    });

    socket.on('chat message', ({ room, username, message, id }) => {
        io.to(room).emit('chat message', { username, message, id });
    });

    socket.on('typing', ({ room, username }) => {
        socket.to(room).emit('typing', { username });
    });

    socket.on('stop typing', ({ room }) => {
        socket.to(room).emit('stop typing');
    });

    socket.on('seen', ({ room, msgId, sender, seenBy }) => {
        socket.to(room).emit('seen', { msgId, sender, seenBy });
    });

    socket.on('file message', data => {
        io.to(data.room).emit('file message', data);
    });

    socket.on('audio message', data => {
        io.to(data.room).emit('audio message', data);
    });

    socket.on('video-offer', data => {
        socket.to(data.room).emit('video-offer', data);
    });

    socket.on('video-answer', data => {
        socket.to(data.room).emit('video-answer', data);
    });

    socket.on('ice-candidate', data => {
        socket.to(data.room).emit('ice-candidate', data);
    });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port: ${PORT}`);
});
