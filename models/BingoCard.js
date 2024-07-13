// models/BingoCard.js
const mongoose = require('mongoose');

const BingoCardSchema = new mongoose.Schema({
    team: { type: String, required: true, unique: true },
    card: { type: String, required: true }
});

module.exports = mongoose.model('BingoCard', BingoCardSchema);