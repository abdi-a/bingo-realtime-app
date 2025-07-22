import React, { useEffect, useState } from "react";
import { socket } from "./socket";
import axios from "axios";
import "./App.css";

const hardcodedBoard = [
  [5, 18, 32, 49, 61],
  [10, 20, 38, 50, 65],
  [3, 16, "FREE", 48, 66],
  [8, 19, 34, 53, 69],
  [2, 24, 37, 58, 70]
];

export default function App() {
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [lastNumber, setLastNumber] = useState(null);
  const [isWinner, setIsWinner] = useState(false);
  const [name, setName] = useState("");
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    socket.on("number-drawn", (number) => {
      setDrawnNumbers((prev) => [...prev, number]);
      setLastNumber(number);
    });

    socket.on("history", (numbers) => {
      setDrawnNumbers(numbers);
      if (numbers.length > 0)
        setLastNumber(numbers[numbers.length - 1]);
    });

    socket.on("game-restart", () => {
      setDrawnNumbers([]);
      setLastNumber(null);
      setIsWinner(false);
      setWinners([]);
    });

    socket.on("winner-list", (list) => {
      setWinners(list);
    });

    return () => {
      socket.off("number-drawn");
      socket.off("history");
      socket.off("game-restart");
      socket.off("winner-list");
    };
  }, []);

  useEffect(() => {
    if (!name) return;
    socket.emit("send-name", name);
  }, [name]);

  useEffect(() => {
    const flatCard = hardcodedBoard.flat().filter(n => n !== "FREE");
    const matches = flatCard.filter((n) => drawnNumbers.includes(n));
    if (!isWinner && matches.length >= 5) {
      setIsWinner(true);
      socket.emit("declare-winner");
    }
  }, [drawnNumbers]);

  const handleRestart = async () => {
    await axios.get("http://localhost:3000/restart");
  };

  if (!name) {
    return (
      <div className="center">
        <h2>Enter your name to join</h2>
        <input
          type="text"
          placeholder="Your name"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              setName(e.target.value.trim());
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <h1>🎱 Realtime Bingo Game</h1>
      <h3>👋 Welcome, {name}</h3>
      <h2>Last Drawn Number: {lastNumber ?? "Waiting..."}</h2>

      <div className="board">
        {hardcodedBoard.map((row, i) => (
          <div className="row" key={i}>
            {row.map((num, j) => {
              const isMatched = drawnNumbers.includes(num);
              const isFree = num === "FREE";
              return (
                <div
                  key={j}
                  className={`cell ${isMatched || isFree ? "marked" : ""}`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {isWinner && <h2 className="winner">🎉 You Win!</h2>}

      <h3>🏆 Winners:</h3>
      <ul>
        {winners.map((w, idx) => (
          <li key={idx}>{w}</li>
        ))}
      </ul>

      <button className="restart" onClick={handleRestart}>🔁 Restart Game</button>
    </div>
  );
}
