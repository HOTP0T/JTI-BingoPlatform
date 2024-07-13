const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const path = require('path');

router.get('/:teamId', async (req, res) => {
  const teamId = req.params.teamId;
  const team = await Team.findById(teamId);

  if (team) {
    res.sendFile(path.join(__dirname, '../../public/bingo.html'));
  } else {
    res.status(404).send('Team not found');
  }
});

module.exports = router;