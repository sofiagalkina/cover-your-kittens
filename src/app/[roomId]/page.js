'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function RoomPage() {
    const { roomId } = useParams(); // Extract the roomId from the dynamic route
    const socketRef = useRef(null);
    const [userList, setUserList] = useState([]); // State for user list
    const [nickname, setNickname] = useState(''); // State for nickname

    useEffect(() => {
        socketRef.current = io();

        const storedNickname = localStorage.getItem('nickname');
        console.log('Nickname retrieved from local storage:', storedNickname);

        // Set the nickname state if it exists
        if (storedNickname) {
            setNickname(storedNickname);
        }

        if (storedNickname && roomId) {
            console.log('Joining room with data:', { roomId, storedNickname });
            socketRef.current.emit('joinRoom', { roomId, nickname: storedNickname }); 
        } else {
            console.error('Room ID or nickname is missing!');
        }

        socketRef.current.on('updateUser List', (userList) => {
            console.log('User  list event received:', userList);
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
            <h2>Your Nickname: <b>{nickname}</b></h2>
            <h2>Players in this room:</h2>
            <ul>
                {userList.map((user, index) => (
                    <li key={index}>{user.nickname}</li>
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