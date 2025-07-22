// server/index.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors());

let drawnNumbers = [];
let interval = null;

function generateNumber() {
  if (drawnNumbers.length >= 75) return null;

  let num;
  do {
    num = Math.floor(Math.random() * 75) + 1;
  } while (drawnNumbers.includes(num));

  drawnNumbers.push(num);
  return num;
}

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // Send history to new user
  socket.emit("history", drawnNumbers);

  // Send name (optional)
  socket.on("send-name", (name) => {
    console.log(`👤 ${name} joined`);
  });

  // Start emitting if not already started
  if (!interval) {
    interval = setInterval(() => {
      const number = generateNumber();
      if (number) {
        io.emit("number-drawn", number);
        console.log("🎯 Number:", number);
      } else {
        clearInterval(interval);
        interval = null;
        io.emit("game-over");
      }
    }, 5000);
  }
});

app.get("/restart", (req, res) => {
  drawnNumbers = [];
  if (interval) clearInterval(interval);
  interval = null;
  io.emit("game-restart");
  res.send("Game restarted");
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
