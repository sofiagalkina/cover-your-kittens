// server.js
const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

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
        console.log(`Room ${roomId} created!`)
    });

    // Listen for a request to JOIN a room:
    socket.on('joinRoom', (roomId) =>{
        socket.join(roomId);
        console.log(`User joined room ${roomId}`)
    });
        
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });

    // Custom game events will go here here (e.g., player joins a game, draws a card, etc.)
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
