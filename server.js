// server.js
const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3000;
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
socket.on('joinRoom', (data) => {
  console.log('joinRoom event data:', data); // Log the full data to ensure it's being received correctly
  const { roomId, nickname } = data;

  if (!roomId || !nickname) {
    console.error('Missing roomId or nickname!');
    return;
  }
    // Store the nickname in the socket for later use
    socket.nickname = nickname;
    socket.roomId = roomId;

  socket.join(roomId);
  console.log(`User ${nickname} joined room ${roomId}`);

  // Add the user's nickname to the list:
  if (!usersInRooms[roomId]) {
    usersInRooms[roomId] = [];
  }
  usersInRooms[roomId].push(nickname);

  // Notify all players in the room that a new player has joined:
  io.to(roomId).emit('newPlayer', `A new player has joined room ${roomId}`);
  io.to(roomId).emit('updateUserList', usersInRooms[roomId]);
});

     

    
    socket.on('disconnect', () => {
        console.log('user disconnected');

        const roomId = socket.roomId;
        const nickname = socket.nickname;
        if(roomId && nickname){
          usersInRooms[roomId] = usersInRooms[roomId].filter(nick => nick !== nickname);

          // emit an updated user list:
          io.to(roomId).emit('updateUserList', usersInRooms[roomId]);
        }

      });

    // Custom game events will go here here (e.g., player joins a game, draws a card, etc.)
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
});
