const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Use the environment variable for MongoDB URI
const MONGO_URI = process.env.MONGO_URI;

// Connect to Mongoose
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch(err => console.error("Connection error", err));

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  team: String
});

// Define Bingo Tile Schema
const tileSchema = new mongoose.Schema({
  tile: String,
  img_path: String,
  text: String,
  team: String,
  flipped: { type: Boolean, default: false },
  note: { type: String, default: "" },
  color: { type: String, default: "white" }
});

const User = mongoose.model('User', userSchema);
const Tile = mongoose.model('Tile', tileSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from the root directory

// API to handle user login/registration
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });

  if (user) {
    console.log(`User ${username} logged in, assigned to team ${user.team}`);
    res.send(user);
  } else {
    console.log(`User ${username} not found`);
    res.status(404).send({ message: 'User not found' });
  }
});

// API to get tiles by team
app.get('/api/tiles', async (req, res) => {
  const { team } = req.query;
  const tiles = await Tile.find({ team });
  console.log(`Sending tiles for team ${team}:`, tiles);
  res.send(tiles);
});

// Handle socket connections
io.on('connection', (socket) => {
  socket.on('join', ({ username, team }) => {
    socket.join(team);
    console.log(`${username} joined team ${team}`);
  });

  socket.on('flipTile', async ({ team, tileId, flipped }) => {
    const tile = await Tile.findByIdAndUpdate(tileId, { flipped }, { new: true });
    io.to(team).emit('tileUpdated', tile);
  });

  socket.on('addNote', async ({ team, tileId, note }) => {
    const tile = await Tile.findByIdAndUpdate(tileId, { note }, { new: true });
    io.to(team).emit('tileUpdated', tile);
  });

  socket.on('changeColor', async ({ team, tileId, color }) => {
    const tile = await Tile.findByIdAndUpdate(tileId, { color }, { new: true });
    io.to(team).emit('tileUpdated', tile);
  });
});

// Serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
