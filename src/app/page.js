'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import io from 'socket.io-client';
import Particle from "../components/Particle";

export default function Home() {
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState('');
  const [generatedRoomId, setGeneratedRoomId] = useState('');
  const router = useRouter(); // Initialize router here
  const [nickname, setNickname] = useState(''); // new state for keeping track of nicknames 
  useEffect(() => {
    // Initialize socket.io client and store it in the ref
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Connected to the server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from the server');
    });

  /*
    socketRef.current.on('newPlayer', (message) => {
      alert(message);
    });
  */

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Handle room creation
  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    socketRef.current.emit('createRoom', newRoomId);
    setGeneratedRoomId(newRoomId);
   
  };

  // Handle joining a room
  const handleJoinRoom = () => {
    if (roomId && nickname) {
      socketRef.current.emit('joinRoom', { roomId: roomId, nickname: nickname});
      console.log(`Joining room ${roomId} with nickname ${nickname}`);
      router.push(`/${roomId}`); // Redirect to the dynamic room page
    }
  };

  return (
    <div className="relative bg-white min-h-screen flex flex-col justify-center items-center">
      {/* Particle Component in the background */}
      <div className="absolute inset-0 z-0 h-screen w-full">
        <Particle />
      </div>

      <img 
        src="/assets/mainMenu.png" // Ensure correct image path
        alt="Main Menu Pusheen Image"
        className="z-10 animate-pulse-scale"
      />

      <div className="menu text-black text-center z-10">
        <h1 className="text-4xl font-bold mb-8">Welcome to Cover Your Kittens!</h1>

        <button
          className="bg-[#b4e2d7] text-black py-2 px-4 rounded hover:bg-opacity-90 transition mb-4"
          onClick={handleCreateRoom}
        >
          Create New Game
        </button>

        {/* Display the generated Room ID */}
        {generatedRoomId && (
          <div className="mt-4">
            <p>Your Room ID is <span className="font-bold">{generatedRoomId}</span></p>
          </div>
        )}

        <div className="mt-4">

          <input
            className="border border-gray-300 rounded px-4 py-2 text-black mb-4"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter Nickname"
          />

          <input
            className="border border-gray-300 rounded px-4 py-2 text-black mb-4 ml-1"
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
          />
          <button
            className="bg-[#ffb0c2] ml-2 text-black py-2 px-4 rounded hover:bg-opacity-90 transition"
            onClick={handleJoinRoom}
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}
