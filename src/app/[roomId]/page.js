'use client'
// Client-side code (in your `RoomPage` component)
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function RoomPage() {
    const { roomId } = useParams(); // Extract the roomId from the dynamic route
    const router = useRouter();
    const socketRef = useRef(null);
    const [userList, setUserList] = useState([]); // State for user list
    const [nickname, setNickname] = useState(''); // State for nickname
    const [gameStarted, setGameStarted] = useState(false); // State to track if the game has started

    useEffect(() => {
        socketRef.current = io(); // Initialize socket.io client

        const storedNickname = localStorage.getItem('nickname');
        console.log('Nickname retrieved from local storage:', storedNickname);

        // Set the nickname state if it exists
        if (storedNickname) {
            setNickname(storedNickname);
        }

        // Emit joinRoom event to inform the server
        if (storedNickname && roomId) {
            console.log('Joining room with data:', { roomId, storedNickname });
            socketRef.current.emit('joinRoom', { roomId, nickname: storedNickname });
        } else {
            console.error('Room ID or nickname is missing!');
        }

        // Listen for the updated user list from the server
        socketRef.current.on('updateUserList', (userList) => {
            console.log('Updated user list:', userList);
            sessionStorage.setItem('userList', JSON.stringify(userList));
            setUserList(userList);
        });

        socketRef.current.on('gameStarted', () => {
            console.log('Game has started!');
            setGameStarted(true);
            router.push(`/game/${roomId}`); // Navigate to game page
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from the server');
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId]);

    const navigateToRoom = (roomId, nickname) => {
        sessionStorage.setItem('roomId', roomId);
        sessionStorage.setItem('nickname', nickname);

        router.push(`/game/${roomId}`);
  };

    return (
        <div className="room-container">
            <h1>Welcome to Room <b>{roomId}</b>!</h1>
            <h2>Your Nickname: <b>{nickname}</b></h2>
            <h2>Players in this room:</h2>
            <ul className='list-disc pl-5'>
                {userList.map((user, index) => (
                    <li className="ml-2" key={index}>{user} </li>
                ))}
            </ul>
            <button onClick={()=> navigateToRoom(roomId, nickname)}
            className="bg-cyan-500 hover:bg-cyan-600 p-2 ml-2 rounded text-white">
              Start Game
            </button>
            <img 
                src="/assets/Version1.png" 
                alt="Main Menu Pusheen Image"
                className=""
            />
        </div>
    );
}
