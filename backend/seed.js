const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Team = require('./models/Team');

mongoose.connect('mongodb://localhost/bingo', { useNewUrlParser: true, useUnifiedTopology: true });

const seedTeams = async () => {
  const passwordHash = await bcrypt.hash('teamPassword', 10);
  const team = new Team({
    name: 'Team A',
    password: passwordHash,
    bingoCard: [] // Add initial bingo card data if needed
  });

  await team.save();
  mongoose.connection.close();
};

seedTeams().then(() => console.log('Seed data added'));