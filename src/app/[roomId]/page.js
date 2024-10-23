'use client';

import { useParams } from 'next/navigation'; // useParams is used to extract dynamic segments from the URL
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function RoomPage() {
    const { roomId } = useParams(); // Extract the roomId from the dynamic route
    const socketRef = useRef(null);
    const [userList, setUserList] = useState([]); // State to store the list of players in the room

    useEffect(() => {
        // Initializing the socket connection
        socketRef.current = io();

        socketRef.current.on('connect', () => {
            console.log('Connected to the server');
            // Emit an event to join the room using the roomId from the URL
            const nickname = localStorage.getItem('nickname');
            socketRef.current.emit('joinRoom', { roomId, nickname }); // Replace 'SomeName' with dynamic nickname
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from the server');
        });

        // Listen for the 'updateUserList' event from the server
        socketRef.current.on('updateUserList', (userList) => {
            console.log('Updated user list:', userList);
            setUserList(userList); // Update the user list when received from the server
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId]); // Dependency on roomId so it runs when the roomId changes

    return (
        <div className="room-container">
            <h1>Welcome to Room <b>{roomId}</b>!</h1>

            <h2>Players in this room:</h2>
            <ul>
                {userList.map((user, index) => (
                    <li key={index}>{user}</li>
                ))}
            </ul>
        </div>
    );
}
