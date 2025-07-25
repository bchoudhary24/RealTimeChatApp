require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// ✅ CORS Setup
app.use(cors({
    origin: "https://splendid-frangollo-6851e6.netlify.app",
    methods: ["GET", "POST"]
}));

// ✅ Middleware
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
    res.send("Real-time Chat App backend is running 🚀");
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ In-memory OTP store
const otpStore = {};

// ✅ Send OTP route
app.post('/api/send-otp', (req, res) => {
    const { email } = req.body;
    const otp = 123456; // For demo; replace with random later
    otpStore[email] = otp;

    console.log(`✅ OTP for ${email}:`, otp);
    res.json({ success: true, otp });
});

// ✅ Verify OTP route
app.post('/api/verify-otp', (req, res) => {
    const { email, code } = req.body;

    if (otpStore[email] && otpStore[email].toString() === code) {
        delete otpStore[email];
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Invalid OTP" });
    }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
