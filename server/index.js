const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // or replace with your frontend URL
    methods: ["GET", "POST"]
  }
});

let drawnNumbers = new Set();
let intervalId = null;

// Helper to generate random number 1–75 that hasn’t been drawn yet
function getRandomBingoNumber() {
  if (drawnNumbers.size >= 75) return null;

  let number;
  do {
    number = Math.floor(Math.random() * 75) + 1;
  } while (drawnNumbers.has(number));

  drawnNumbers.add(number);
  return number;
}

// Emit new number every 5 seconds
function startDrawingNumbers() {
  if (intervalId) return; // Prevent multiple intervals

  intervalId = setInterval(() => {
    const number = getRandomBingoNumber();
    if (number) {
      console.log("Drawn:", number);
      io.emit("number-drawn", number);
    } else {
      clearInterval(intervalId);
      intervalId = null;
      console.log("All 75 numbers have been drawn.");
    }
  }, 5000);
}

// Start drawing when first client connects
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  // Send all past drawn numbers to new client
  socket.emit("all-drawn-numbers", Array.from(drawnNumbers));

  if (!intervalId) {
    startDrawingNumbers();
  }

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Restart endpoint
app.get("/restart", (req, res) => {
  drawnNumbers.clear();
  clearInterval(intervalId);
  intervalId = null;
  io.emit("game-restarted");
  res.json({ message: "Game restarted" });
  console.log("🔄 Game reset.");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
