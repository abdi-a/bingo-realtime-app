// client/src/socket.js
import { io } from 'socket.io-client';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const socket = io(BACKEND_URL, {
  transports: ['websocket'], // ensures real-time connection
});

export default socket;
