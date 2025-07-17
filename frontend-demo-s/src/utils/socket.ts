// src/utils/socket.ts
import { io as clientIo, Socket } from 'socket.io-client';

const URL = 'https://rj-755j.onrender.com';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = clientIo(URL, { transports: ['websocket'] });
  }
  return socket;
}
