// src/utils/socket.ts
import { io as clientIo, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

const URL = API_CONFIG.SOCKET_URL;

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = clientIo(URL, { 
      transports: ['websocket'],
      secure: true,
      rejectUnauthorized: false // Only for development, remove in production with valid SSL
    });
  }
  return socket;
}
