const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('../models/User'); // Ensure the correct path

const app = express();
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.post('/login', async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: 'Username not found' });
    }

    res.json({ message: 'Login successful', team: user.team });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
