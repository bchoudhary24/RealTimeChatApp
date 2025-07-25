require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + '/public'));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Temporary in-memory OTP store
const otpStore = {};

// ✅ Send OTP route (demo, fixed OTP)
app.post('/api/send-otp', (req, res) => {
    const { email } = req.body;
    const otp = 123456; // Fixed demo OTP
    otpStore[email] = otp;

    console.log('✅ OTP generated (demo):', otp);

    // Send OTP in response so user can see (demo purpose)
    res.json({ success: true, otp: otp });
});

// ✅ Verify OTP route
app.post('/api/verify-otp', (req, res) => {
    const { email, code } = req.body;
    if (otpStore[email] && otpStore[email].toString() === code) {
        delete otpStore[email]; // clear used otp
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// ✅ Socket.io for chat
io.on('connection', (socket) => {
    console.log('🔌 New user connected');

    socket.on('join', ({ username, room }) => {
        socket.join(room);
        console.log(`👤${ username }joined room: ${ room }`);
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
    //listen when someone reads a message
    socket.on('seen', ({ room, msgId, sender, seenBy, }) => {
        // sirf sender ko message send karo
        socket.to(room).emit('seen', { msgId, sender, seenBy });
    });
    // File / image message
    socket.on('file message', data => {
        io.to(data.room).emit('file message', data);
    });

    // Audio / voice recording message
    socket.on('audio message', data => {
        io.to(data.room).emit('audio message', data);
    });

    // (Future) video call signals
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
server.listen(process.env.PORT || 5000, () =>
    console.log(`🚀Server running on http://localhost:${process.env.PORT || 5000}`)
);