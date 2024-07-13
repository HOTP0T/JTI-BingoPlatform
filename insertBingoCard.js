// insertBingoCards.js
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI; // Use the environment variable for the connection string

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Get the database
    const database = client.db('bingosrs'); // Replace with your actual database name
    // Get the collection
    const collection = database.collection('bingo_cards'); // This will be the collection to store bingo cards

    // Insert sample bingo cards
    const bingoCards = [
      { team: 'TeamA', card: 'TeamA-specific bingo card content' },
      { team: 'TeamB', card: 'TeamB-specific bingo card content' }
    ];

    await collection.insertMany(bingoCards);
    console.log('Bingo cards inserted');
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);