const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Team = require('../models/Team');

router.post('/login', async (req, res) => {
  const { password } = req.body;
  const team = await Team.findOne({ password });

  if (team && await bcrypt.compare(password, team.password)) {
    res.redirect(`/bingo/${team._id}`);
  } else {
    res.status(401).send('Invalid password');
  }
});

module.exports = router;