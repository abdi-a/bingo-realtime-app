let winners = [];

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);
  socket.emit("history", drawnNumbers);
  socket.emit("winner-list", winners);

  socket.on("send-name", (name) => {
    socket.data.name = name;
    console.log(`👤 ${name} joined`);
  });

  socket.on("declare-winner", () => {
    const winnerName = socket.data.name || "Unknown";
    if (!winners.includes(winnerName)) {
      winners.push(winnerName);
      io.emit("winner-list", winners);
      console.log(`🏆 Winner: ${winnerName}`);
    }
  });

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
  winners = [];
  if (interval) clearInterval(interval);
  interval = null;
  io.emit("game-restart");
  res.send("Game restarted");
});
