const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const Player = require("./models/player");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/arena");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let value = 0;

let data = {
  roll: 0,
  message: "",
};

app.get("/", (req, res) => {
  data.message = "";
  res.render("index");
});

let toggle = {
  attack: "",
  defend: "disabled",
};

app.post("/arena", async (req, res) => {
  toggle.attack = "";
  toggle.defend = "disabled";
  data.message = "";
  await Player.deleteMany({});
  const player1 = new Player({
    id: 1,
    name: req.body.player1,
    health: Math.floor(Math.random() * 51) + 50,
    strength: Math.floor(Math.random() * 11) + 5,
    attack: Math.floor(Math.random() * 11) + 5,
    button: "",
    power: 0,
  });
  const player2 = new Player({
    id: 2,
    name: req.body.player2,
    health: Math.floor(Math.random() * 51) + 50,
    strength: Math.floor(Math.random() * 11) + 5,
    attack: Math.floor(Math.random() * 11) + 5,
    button: "",
    power: 0,
  });
  if (player1.health < player2.health) {
    player1.button = "attack";
    player2.button = "defend";
  } else {
    player2.button = "attack";
    player1.button = "defend";
  }
  await player1.save();
  await player2.save();
  res.render("arena", { player1, player2, data, toggle });
});

app.post("/attack", async (req, res) => {
  value = rollDie();
  data.roll = value;
  toggle.attack = "disabled";
  toggle.defend = "";
  let attacker = await Player.find({ button: "attack" });
  let attack = attacker[0].attack * value;

  attacker[0].power = attack;
  await attacker[0].save();

  const players = await Player.find();
  const player1 = players[0];
  const player2 = players[1];
  res.render("arena", { player1, player2, data, toggle });
});

app.post("/defend", async (req, res) => {
  value = rollDie();
  data.roll = value;
  toggle.attack = "";
  toggle.defend = "disabled";
  let attacker = await Player.find({ button: "attack" });
  let defender = await Player.find({ button: "defend" });

  let defend = defender[0].strength * value;

  const damage = attacker[0].power - defend;

  if (damage < 0) {
    defender[0].health = defender[0].health;
  } else {
    defender[0].health = defender[0].health - damage;
  }

  if (defender[0].health < 0) {
    defender[0].health = 0;
    toggle.attack = "disabled";
    toggle.defend = "disabled";
    data.message = `Victory, ${attacker[0].name} won the arena.`;
  }

  attacker[0].button = "defend";
  defender[0].button = "attack";
  await attacker[0].save();
  await defender[0].save();

  const players = await Player.find();
  const player1 = players[0];
  const player2 = players[1];
  res.render("arena", { player1, player2, data, toggle });
});

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

app.post("/exit", (req, res) => {
  res.render("index");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
