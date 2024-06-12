const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
  id: Number,
  name: String,
  health: Number,
  strength: Number,
  attack: Number,
  button: String,
  power: Number,
  roll: Number,
});

module.exports = mongoose.model("Player", PlayerSchema);
