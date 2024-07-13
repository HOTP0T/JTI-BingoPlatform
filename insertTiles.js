// insertTiles.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load the BingoCard model
const BingoCard = require('./models/BingoCard');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Load the JSON data
const bingoCardData = JSON.parse(fs.readFileSync(path.join(__dirname, './public/Data/updated_bingo.json'), 'utf-8'));

// Insert the bingo card data
async function insertBingoCard() {
  try {
    const team = "TeamA"; // Example team name
    let bingoCard = await BingoCard.findOne({ team });
    if (!bingoCard) {
      bingoCard = new BingoCard({ team, card: JSON.stringify(bingoCardData.BingoTiles) });
      await bingoCard.save();
      console.log('Bingo card inserted');
    } else {
      console.log('Bingo card already exists');
    }
  } catch (err) {
    console.error('Error inserting bingo card:', err);
  } finally {
    mongoose.disconnect();
  }
}

insertBingoCard();