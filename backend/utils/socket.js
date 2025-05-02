// backend/utils/socket.js
import { Server } from 'socket.io';

let io;

const initSocket = (server) => {
  io = new Server(server); // Initialize socket.io with the server

  // Set up socket connection logic
  io.on('connection', (socket) => {
    console.log('A user connected');

    // You can emit events here as well, for example, when a task is assigned
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

// Export the initialized socket instance
const getSocket = () => io;

export { initSocket, getSocket };
