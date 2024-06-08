const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/bingo', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: String,
  team: String
});

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

const users = [
  { username: "player1", team: "1" },
  { username: "player2", team: "2" }
];

const tiles = [
  { tile: "Any wildy pet", img_path: "../assets/luna.jpg", text: "This is the text for Any wildy pet.", team: "1" },
  { tile: "VW from scratch", img_path: "../assets/luna.jpg", text: "This is the text for VW from scratch.", team: "1" },
  { tile: "Ring of the gods, treasonous, tyrannical", img_path: "../assets/luna.jpg", text: "This is the text for Ring of the gods, treasonous, tyrannical.", team: "1" },
  { tile: "D pick & D2H", img_path: "../assets/luna.jpg", text: "This is the text for D pick & D2H.", team: "1" },
  { tile: "Claws, fangs, skull", img_path: "../assets/luna.jpg", text: "This is the text for Claws, fangs, skull.", team: "1" },
  { tile: "Odium from scratch", img_path: "../assets/luna.jpg", text: "This is the text for Odium from scratch.", team: "1" },
  { tile: "Chaos druid set", img_path: "../assets/luna.jpg", text: "This is the text for Chaos druid set.", team: "1" },
  { tile: "Any rev weapon", img_path: "../assets/luna.jpg", text: "This is the text for Any rev weapon.", team: "1" },
  { tile: "Ancient crystal", img_path: "../assets/luna.jpg", text: "This is the text for Ancient crystal.", team: "1" },
  { tile: "Any 4 statuettes (no dupes)", img_path: "../assets/luna.jpg", text: "This is the text for Any 4 statuettes (no dupes).", team: "1" },
  { tile: "Averice", img_path: "../assets/luna.jpg", text: "This is the text for Averice.", team: "1" },
  { tile: "Dagon hai set", img_path: "../assets/luna.jpg", text: "This is the text for Dagon hai set.", team: "1" },
  { tile: "Teleport scroll", img_path: "../assets/luna.jpg", text: "This is the text for Teleport scroll.", team: "1" },
  { tile: "D boots", img_path: "../assets/luna.jpg", text: "This is the text for D boots.", team: "1" },
  { tile: "Whip", img_path: "../assets/luna.jpg", text: "This is the text for Whip.", team: "1" },
  { tile: "Imbued heart or eternal gem", img_path: "../assets/luna.jpg", text: "This is the text for Imbued heart or eternal gem.", team: "1" },
  { tile: "Eternal glory", img_path: "../assets/luna.jpg", text: "This is the text for Eternal glory.", team: "1" },
  { tile: "3m agility xp collectively", img_path: "../assets/luna.jpg", text: "This is the text for 3m agility xp collectively.", team: "1" },
  { tile: "Malediction from scratch", img_path: "../assets/luna.jpg", text: "This is the text for Malediction from scratch.", team: "1" },
  { tile: "3m fishing xp collectively", img_path: "../assets/luna.jpg", text: "This is the text for 3m fishing xp collectively.", team: "1" },
  { tile: "3m thieving xp collectively", img_path: "../assets/luna.jpg", text: "This is the text for 3m thieving xp collectively.", team: "1" },
  { tile: "KBD heads", img_path: "../assets/luna.jpg", text: "This is the text for KBD heads.", team: "1" },
  { tile: "3m hunter xp collectively", img_path: "../assets/luna.jpg", text: "This is the text for 3m hunter xp collectively.", team: "1" },
  { tile: "10 lms wins collectively", img_path: "../assets/luna.jpg", text: "This is the text for 10 lms wins collectively.", team: "1" },
  { tile: "Pk 20m total collectively", img_path: "../assets/luna.jpg", text: "This is the text for Pk 20m total collectively.", team: "1" },

  { tile: "Any wildy pet", img_path: "../assets/luna.jpg", text: "This is the text for Any wildy pet.", team: "2" },
  { tile: "VW from scratch", img_path: "../assets/luna.jpg", text: "This is the text for VW from scratch.", team: "2" },
  { tile: "Ring of the gods, treasonous, tyrannical", img_path: "../assets/luna.jpg", text: "This is the text for Ring of the gods, treasonous, tyrannical.", team: "2" },
  { tile: "D pick & D2H", img_path: "../assets/luna.jpg", text: "This is the text for D pick & D2H.", team: "2" },
  { tile: "Claws, fangs, skull", img_path: "../assets/luna.jpg", text: "This is the text for Claws, fangs, skull.", team: "2" },
  { tile: "Odium from scratch", img_path: "../assets/luna.jpg", text: "This is the text for Odium from scratch.", team: "2" },
  { tile: "Chaos druid set", img_path: "../assets/luna.jpg", text: "This is the text for Chaos druid set.", team: "2" },
  { tile: "Any rev weapon", img_path: "../assets/luna.jpg", text: "This is the text for Any rev weapon.", team: "2" },
  { tile: "Ancient crystal", img_path: "../assets/luna.jpg", text: "This is the text for Ancient crystal.", team: "2" },
  { tile: "Any 4 statuettes (no dupes)", img_path: "../assets/luna.jpg", text: "This is the text for Any 4 statuettes (no dupes).", team: "2" },
  { tile: "Averice", img_path: "../assets/luna.jpg", text: "This is the text for Averice.", team: "2" },
  { tile: "Dagon hai set", img_path: "../assets/luna.jpg", text: "This is the text for Dagon hai set.", team: "2" },
  { tile: "Teleport scroll", img_path: "../assets/luna.jpg", text: "This is the text for Teleport scroll.", team: "2" },
  { tile: "D boots", img_path: "../assets/luna.jpg", text: "This is the text for D boots.", team: "2" },
  { tile: "Whip", img_path: "../assets/luna.jpg", text: "This is the text for Whip.", team: "2" },
  { tile: "Imbued heart or eternal gem", img_path: "../assets/luna.jpg", text: "This is the text for Imbued heart or eternal gem.", team: "2" },
  { tile: "Eternal glory", img_path: "../assets/luna.jpg", text: "This is the text for Eternal glory.", team: "2" },
  { tile: "3m agility xp collectively", img_path: "../assets/luna.jpg", text: "This is the text for 3m agility xp collectively.", team: "2" },
  { tile: "Malediction from scratch", img_path: "../assets/luna.jpg", text: "This is the text for Malediction from scratch.", team: "2" },
  { tile: "3m fishing xp collectively", img_path: "../assets/luna.jpg", text: "This is the text for 3m fishing xp collectively.", team: "2" },
  { tile: "3m thieving xp collectively", img_path: "../assets/luna.jpg", text: "This is the text for 3m thieving xp collectively.", team: "2" },
  { tile: "KBD heads", img_path: "../assets/luna.jpg", text: "This is the text for KBD heads.", team: "2" },
  { tile: "3m hunter xp collectively", img_path: "../assets/luna.jpg", text: "This is the text for 3m hunter xp collectively.", team: "2" },
  { tile: "10 lms wins collectively", img_path: "../assets/luna.jpg", text: "This is the text for 10 lms wins collectively.", team: "2" },
  { tile: "Pk 20m total collectively", img_path: "../assets/luna.jpg", text: "This is the text for Pk 20m total collectively.", team: "2" }
];

async function populate() {
  await User.deleteMany({});
  await Tile.deleteMany({});
  
  await User.insertMany(users);
  await Tile.insertMany(tiles);
  
  console.log('Data successfully populated');
  mongoose.connection.close();
}

populate().catch(err => console.error(err));
