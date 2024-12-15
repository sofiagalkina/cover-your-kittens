const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const players = {}; // Store players and their cards, keyed by roomId
const userList = {}; // Store the full list of users in all rooms

app.prepare().then(() => {
    const server = createServer((req, res) => {
        handle(req, res);
    });

    // Initialize socket.io
    const io = new Server(server, {
        cors: {
            origin: '*', // Allow all origins
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Handle room creation
        socket.on('createRoom', (roomId) => {
            socket.join(roomId);
            if (!players[roomId]) {
                players[roomId] = {}; // Initialize room if not already created
            }
            console.log(`Room ${roomId} created!`);
        });

        // Handle joining a room
        socket.on('joinRoom', (data) => {
            const { roomId, nickname } = data;

            if (!roomId || !nickname) {
                console.error('Missing roomId or nickname!');
                return;
            }

            socket.join(roomId);
            console.log(`User ${nickname} joined room ${roomId}`);

            // Add the user to the room
            if (!players[roomId]) {
                players[roomId] = {};
            }
            players[roomId][socket.id] = nickname;

            // Track user globally in `userList`
            userList[socket.id] = { roomId, nickname };

            // Emit the updated user list to the room
            const updatedUserList = Object.values(players[roomId]);
            io.to(roomId).emit('updateUserList', updatedUserList);
            console.log(`User list for room ${roomId}:`, updatedUserList);
        });

        // Handle game start
        socket.on('startGame', ({ roomId }) => {
            const roomPlayers = players[roomId];
            if (!roomPlayers || Object.keys(roomPlayers).length === 0) {
                console.error(`No players found for room: ${roomId}`);
                return;
            }

            const deck = shuffleDeck([...originalDeck]); // Shuffle the deck
            Object.keys(roomPlayers).forEach((playerId) => {
                const cards = deck.splice(0, 4); // Assign 4 cards
                io.to(playerId).emit('receiveCards', cards);
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);

            // Remove the user from all rooms and update user lists
            for (const roomId in players) {
                if (players[roomId][socket.id]) {
                    delete players[roomId][socket.id]; // Remove user from room
                    const updatedUserList = Object.values(players[roomId]);
                    io.to(roomId).emit('updateUserList', updatedUserList); // Notify others in the room
                }
            }

            // Remove user from global list
            delete userList[socket.id];
        });
    });

    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});

// Deck and card shuffling logic
const originalDeck = [
    'card1.png', 'card2.png', 'card3.png', 'card4.png',
    'card5.png', 'card6.png', 'card7.png', 'card8.png',
    'card9.png', 'card10.png', 'card11.png', 'card12.png',
];

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}
