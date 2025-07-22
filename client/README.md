# Realtime Bingo App (Vite + React + MUI)

This is the frontend for the Realtime Bingo App, built with [Vite](https://vitejs.dev/), [React](https://react.dev/), [Material-UI (MUI)](https://mui.com/), and [Socket.IO](https://socket.io/).

## Features
- Beautiful, responsive UI with Material-UI
- Real-time Bingo board updates via Socket.IO
- Name entry before joining the game
- Winner tracking and display
- Restart button to reset the game
- Fully centered, full-page layout

## Setup & Usage

### 1. Install dependencies
```sh
npm install
```

### 2. Start the development server
```sh
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

### 3. Connect to the backend
Make sure the backend server (Node.js + Express + Socket.IO) is running at `http://localhost:4000`.

## Project Structure
```
client/
├── src/
│   ├── App.jsx         # Main React app (Bingo logic)
│   └── socket.js       # Socket.IO client setup
├── package.json
└── README.md
```

## Technologies Used
- [Vite](https://vitejs.dev/) (React template)
- [React](https://react.dev/)
- [Material-UI (MUI)](https://mui.com/)
- [Socket.IO Client](https://socket.io/)

## Customization
- You can easily change the Bingo board numbers in `src/App.jsx`.
- The UI is fully responsive and can be themed using MUI.

## License
MIT
