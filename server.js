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

    const io = new Server(server, {
        cors: {
            origin: '*', // allow all origins 
            methods: ['GET', 'POST'],
        },
    });


    io.on('connection', (socket) => {
        console.log('a user connected');

        // Listening for a request to CREATE a room:
        socket.on('createRoom', (roomId) => {
            socket.join(roomId);
            usersInRooms[roomId] = []; // Initialize the room's user list
            console.log(`Room ${roomId} created!`);
        });

        // Listen for a request to JOIN a room:
      /*  socket.on('joinRoom', (data) => {
            console.log('joinRoom event data:', data);
            const { roomId, nickname } = data;

            if (!roomId || !nickname) {
                console.error('Missing roomId or nickname!');
                return;
            }

            socket.join(roomId);
            console.log(`User ${nickname} joined room ${roomId}`);

            // Add the user's nickname to the list:
            if (!usersInRooms[roomId]) {
                usersInRooms[roomId] = [];
            }
            if (!usersInRooms[roomId].includes(nickname)) {
                usersInRooms[roomId].push(nickname);
            }

            // Notify all players in the room:
            io.to(roomId).emit('newPlayer', `A new player has joined room ${roomId}`);
            io.to(roomId).emit('updateUserList', usersInRooms[roomId]);
            console.log(`User list for room ${roomId} after join:`, usersInRooms[roomId]);
        });
*/
io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('joinRoom', (data) => {
        const roomId = data.roomId;
        const nickname = data.nickname;

        // Add the user to the room
        const room = io.sockets.adapter.rooms[roomId];
        if (!room) {
            io.sockets.adapter.rooms[roomId] = [];
        }
        io.sockets.adapter.rooms[roomId].push({ id: socket.id, nickname: nickname });

        // Emit the updated user list to all clients in the room
        const userList = io.sockets.adapter.rooms[roomId].map((user) => user.nickname);
        io.to(roomId).emit('updateUser List', userList);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

        socket.on('disconnect', () => {
            console.log('user disconnected');

            const roomId = socket.roomId;
            const nickname = socket.nickname;
            if (roomId && nickname) {
                usersInRooms[roomId] = usersInRooms[roomId].filter(nick => nick !== nickname);
                // Emit an updated user list:
                console.log(`User list for room ${roomId}: (this is from server.js)`);
                io.to(roomId).emit('updateUserList', usersInRooms[roomId]);
            }
        });

        // Additional game events can be handled here
    });

    server.listen(PORT, () => {
        console.log(`Server running on port http://localhost:${PORT}`);
    });
});
