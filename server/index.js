import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend domain in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());

let drawnNumbers = new Set();
let intervalId = null;

function startDrawingNumbers() {
  if (intervalId) return; // prevent multiple intervals

  intervalId = setInterval(() => {
    if (drawnNumbers.size >= 75) {
      clearInterval(intervalId);
      return;
    }

    let num;
    do {
      num = Math.floor(Math.random() * 75) + 1;
    } while (drawnNumbers.has(num));

    drawnNumbers.add(num);
    console.log("Number drawn:", num);

    io.emit("number-drawn", num);
  }, 5000); // Every 5 seconds
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send already drawn numbers
  socket.emit("previous-numbers", Array.from(drawnNumbers));
});

// Optional restart route
app.get("/restart", (req, res) => {
  drawnNumbers.clear();
  clearInterval(intervalId);
  intervalId = null;
  startDrawingNumbers();
  io.emit("game-restarted");
  res.send("Game restarted");
});

// Start drawing immediately
startDrawingNumbers();

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
