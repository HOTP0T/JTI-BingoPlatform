require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const path = require('path');
const fs = require('fs');
const socketIo = require('socket.io');
const User = require('./models/User');
const BingoCard = require('./models/BingoCard');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 4000;

app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).send('Access denied');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
}

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register
app.post('/register', async (req, res) => {
    const { username, password, team } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, team });
    await user.save();

    // Create a bingo card for the team if it doesn't already exist
    let bingoCard = await BingoCard.findOne({ team });
    if (!bingoCard) {
        const bingoCardData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/Data/updated_bingo.json'), 'utf-8'));
        bingoCard = new BingoCard({ team, card: JSON.stringify(bingoCardData.BingoTiles) });
        await bingoCard.save();
    }

    res.send('User registered');
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id, team: user.team }, process.env.JWT_SECRET);
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Bingo Card Route
app.get('/bingo-card', authenticateToken, async (req, res) => {
    const team = req.user.team;
    try {
        const bingoCard = await BingoCard.findOne({ team });
        if (bingoCard) {
            res.json(JSON.parse(bingoCard.card));
        } else {
            res.status(404).send('Bingo card not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('update-card', async (data) => {
        const { team, card } = data;
        
        try {
            let bingoCard = await BingoCard.findOne({ team });
            if (bingoCard) {
                bingoCard.card = JSON.stringify(card);
                await bingoCard.save();
                io.emit('card-updated', { team, card: JSON.parse(bingoCard.card) });
            }
        } catch (error) {
            console.error('Error updating card:', error);
        }
    });
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});