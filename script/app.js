const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Use helmet for security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "http://127.0.0.1:4000"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "font-src": ["'self'", "data:"],
        "img-src": ["'self'", "data:"]
      },
    },
  })
);

// Connect to MongoDB
mongoose.connect('mongodb://localhost/bingo');

// Routes
const authRoutes = require('../backend/routes/auth');
const bingoRoutes = require('../backend/routes/bingo');


app.use('/auth', authRoutes);
app.use('/bingo', bingoRoutes);

// Serve index.html for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  socket.on('updateCard', (data) => {
    io.to(data.room).emit('updateCard', data.card);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});