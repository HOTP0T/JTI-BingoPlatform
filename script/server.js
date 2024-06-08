const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// MongoDB URI
const uri = "mongodb+srv://tpcmaky:<password>@jti-bingo-cluster.metzsgm.mongodb.net/?retryWrites=true&w=majority&appName=JTI-Bingo-Cluster";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToMongoDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
}

// Connect to MongoDB
connectToMongoDB().catch(console.dir);

// Connect to Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
