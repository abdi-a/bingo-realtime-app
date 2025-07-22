# Realtime Bingo App Backend (Node.js + Express + Socket.IO)

This is the backend server for the Realtime Bingo App, built with [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), and [Socket.IO](https://socket.io/).

## Features
- Emits a random Bingo number (1–75) every 5 seconds (configurable)
- Tracks all drawn numbers and broadcasts them to all connected clients in real-time
- Sends the full list of drawn numbers and the first winner to new clients
- Tracks and broadcasts the first winner
- `/restart` endpoint to reset the game

## Environment Variables

You can configure the backend using a `.env` file in the `server/` directory. See `.env.example` for reference.

| Variable           | Default | Description                       |
|--------------------|---------|-----------------------------------|
| PORT               | 4000    | Port for the backend server       |
| BINGO_INTERVAL_MS  | 5000    | Interval (ms) between draws       |

Example `.env`:
```
PORT=4000
BINGO_INTERVAL_MS=5000
```

## Setup & Usage

### 1. Install dependencies
```sh
npm install
```

### 2. Start the server
```sh
npm start
```

The server will run on [http://localhost:4000](http://localhost:4000) by default.

## API Endpoints

### POST `/restart`
- Resets the game (clears drawn numbers and winner, restarts drawing)
- Notifies all connected clients to reset their boards
- Example using `curl`:
  ```sh
  curl -X POST http://localhost:4000/restart
  ```

## Socket.IO Events
- `number-drawn` — Sent to all clients when a new number is drawn
- `init` — Sent to new clients with the full list of drawn numbers and the first winner
- `restart` — Sent to all clients when the game is reset
- `winner` — Sent to all clients when the first winner is declared
- `bingo-win` — Received from a client when they win (with their name)

## Project Structure
```
server/
├── index.js        # Main server code
├── package.json
├── .env.example    # Example environment file
└── README.md
```

## Technologies Used
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [CORS](https://www.npmjs.com/package/cors)
- [dotenv](https://www.npmjs.com/package/dotenv)

## License
MIT 