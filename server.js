// server.js
const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const usersInRooms = {};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('a user connected');

    // Listening for a request to CREATE a room:
    socket.on('createRoom', (roomId) =>{
        socket.join(roomId);
        usersInRooms[roomId] = []; // this is gonna be our room's user list displayed 
        console.log(`Room ${roomId} created!`)
    });

      // Listen for a request to JOIN a room:
      socket.on('joinRoom', ({ roomId, nickname }) =>{
          socket.join(roomId);
          console.log(`User ${nickname} joined room ${roomId}`)

          // ensuring usersInRooms is properly updated:
          if(!usersInRooms[roomId]){
            usersInRooms[roomId] = [];
          }
          usersInRooms[roomId].push(nickname);
      // Notifying all players in the room that a new player has joined:
        io.to(roomId).emit('newPlayer', `A new player (${nickname}) has joined room ${roomId}`); 
        io.to(roomId).emit('updateUserList', usersInRooms[roomId]);
      });

    
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });

    // Custom game events will go here here (e.g., player joins a game, draws a card, etc.)
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
});
