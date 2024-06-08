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

if (!MONGO_URI) {
  console.error("MONGO_URI environment variable is not set.");
  process.exit(1);
}

// Connect to Mongoose
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch(err => {
    console.error("Connection error", err);
    process.exit(1);
  });

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
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (user) {
      console.log(`User ${username} logged in, assigned to team ${user.team}`);
      res.send(user);
    } else {
      console.log(`User ${username} not found`);
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Error during login", error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// API to get tiles by team
app.get('/api/tiles', async (req, res) => {
  try {
    const { team } = req.query;
    const tiles = await Tile.find({ team });
    console.log(`Sending tiles for team ${team}:`, tiles);
    res.send(tiles);
  } catch (error) {
    console.error("Error fetching tiles", error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Handle socket connections
io.on('connection', (socket) => {
  socket.on('join', ({ username, team }) => {
    socket.join(team);
    console.log(`${username} joined team ${team}`);
  });

  socket.on('flipTile', async ({ team, tileId, flipped }) => {
    try {
      const tile = await Tile.findByIdAndUpdate(tileId, { flipped }, { new: true });
      io.to(team).emit('tileUpdated', tile);
    } catch (error) {
      console.error("Error flipping tile", error);
    }
  });

  socket.on('addNote', async ({ team, tileId, note }) => {
    try {
      const tile = await Tile.findByIdAndUpdate(tileId, { note }, { new: true });
      io.to(team).emit('tileUpdated', tile);
    } catch (error) {
      console.error("Error adding note", error);
    }
  });

  socket.on('changeColor', async ({ team, tileId, color }) => {
    try {
      const tile = await Tile.findByIdAndUpdate(tileId, { color }, { new: true });
      io.to(team).emit('tileUpdated', tile);
    } catch (error) {
      console.error("Error changing color", error);
    }
  });
});

// Serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
