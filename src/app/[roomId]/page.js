'use client';


import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function RoomPage() {
    const { roomId } = useParams(); // Extract the roomId from the dynamic route
    const socketRef = useRef(null);
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        socketRef.current = io();

        const nickname = localStorage.getItem('nickname');
        console.log('Nickname retrieved from local storage {roomId/page.js):', nickname);

        if (nickname && roomId) {
            console.log('Joining room with data:', { roomId, nickname }); // Log the data being sent
            socketRef.current.emit('joinRoom', { roomId, nickname }); 
          } else {
            console.error('Room ID or nickname is missing!');
          }


        socketRef.current.on('updateUserList', (userList) => {
            console.log('User list event received: (this is [roomId]/page.js', userList);
            setUserList(userList);

        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from the server');
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId]);

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
                src="/assets/Version1.png" 
                alt="Main Menu Pusheen Image"
                className=""
            />
        </div>
    );
}
