const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ Enable CORS for ALL routes including /restart
app.use(cors({
  origin: "http://localhost:5173", // Your frontend (Vite) origin
  methods: ["GET", "POST"],
  credentials: true               // optional, only if using cookies/auth
}));

app.use(express.json());

// ✅ Sample restart route
app.get("/restart", (req, res) => {
  console.log("🔄 Game restarted");
  res.json({ message: "Game restarted successfully" });
});

// ✅ Socket.IO config
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  }
});

// ✅ Socket event
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
