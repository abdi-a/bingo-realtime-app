import { io } from 'socket.io-client';

const socket = io('https://bingo-realtime-app-1.onrender.com');

export default socket; 