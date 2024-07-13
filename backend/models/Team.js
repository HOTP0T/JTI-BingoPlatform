const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: String,
  password: String, // Store the hashed password
  bingoCard: Array
});

module.exports = mongoose.model('Team', teamSchema);