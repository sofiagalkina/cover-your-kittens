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

            if(nickname && roomId){
            socketRef.current.emit('joinRoom', { roomId, nickname }); 
            }
        });

        socketRef.current.on('updateUserList', (userList) => {
            console.log('User list event received:', userList);
            setUserList(userList);
          });
          

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from the server');
        });

        socketRef.current.on('updateUserList', (userList) => {
            console.log('Received updated user list:', userList); // <-- Ensure this is here
            setUserList(userList); // Update the user list state
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
        <img 
      src="/assets/Version1.png" // Ensure correct image path
      alt="Main Menu Pusheen Image"
      className=""
      />
        </div>
    );
}
