'use client';

import { useParams } from 'next/navigation'; // useParams is used to extract dynamic segments from the URL
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export default function RoomPage() {
    const { roomId } = useParams(); // Extract the roomId from the dynamic route
    const socketRef = useRef(null);

    useEffect(() => {
        // Initializing the socket connection
        socketRef.current = io();

        socketRef.current.on('connect', () => {
            console.log('Connected to the server');
            // Emit an event to join the room using the roomId from the URL
            socketRef.current.emit('joinRoom', roomId);
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from the server');
        });

        /* COMMENTING OUT THE ALERT COZ IT'S ANNOYING
        socketRef.current.on('newPlayer', (message) => {
            alert(message); // Alert when a new player joins
        });
        */
        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId]); // Dependency on roomId so it runs when the roomId changes

    return (
        <div className="room-container">
            <h1>Welcome to Room <b>{roomId}</b>!</h1>
            {/* You can add other game-related UI elements here */}
        </div>
    );
}
