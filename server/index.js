const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');


const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 4000;
const BINGO_MIN = 1;
const BINGO_MAX = 75;
const BINGO_INTERVAL_MS = 5000;
let drawnNumbers = [];
let interval = null;
let firstWinner = null;

function getRandomNumber() {
  const available = [];
  for (let i = BINGO_MIN; i <= BINGO_MAX; i++) {
    if (!drawnNumbers.includes(i)) available.push(i);
  }
  if (available.length === 0) return null;
  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

function startDrawing() {
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    const number = getRandomNumber();
    if (number === null) {
      clearInterval(interval);
      return;
    }
    drawnNumbers.push(number);
    io.emit('number-drawn', { number, drawnNumbers });
  }, BINGO_INTERVAL_MS);
}

io.on('connection', (socket) => {
  // Send full history and winner to new client
  socket.emit('init', { drawnNumbers, firstWinner });

  socket.on('bingo-win', (name) => {
    if (!firstWinner) {
      firstWinner = name;
      io.emit('winner', name);
    }
  });
});

app.post('/restart', (req, res) => {
  drawnNumbers = [];
  firstWinner = null;
  startDrawing();
  io.emit('restart');
  res.json({ success: true });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startDrawing();
}); 