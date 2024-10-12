'use client'; // This ensures the useEffect runs on the client-side
import { useState, useEffect } from 'react';
import Image from 'next/image';
import io from 'socket.io-client';

export default function Home() {
  
  useEffect(() => {
    const socket = io();

    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from the server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // placeholders for rooms stuff:
  const [roomId, setRoomId] = useState('');
  // handle CREATE room:
  const handleCreateRoom = () =>{ 
      //generating a new room id:
      const newRoomId = Math.random().toString(36).substring(2,9);
      socket.emit('createRoom', newRoomId);
      console.log("New Room ID: ", newRoomId);
  };

  const handleJoinRoom = () => {
      if(roomId){
        socket.emit('joinRoom', roomId);
        console.log("Joining room ", roomId);
        // implement the "connect to the room" later ..... tbc
      }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-center items-center">
    <img src="assets/mainMenu.png"
    alt="Main Menu Pusheen Image">
    </img>
      <div className="menu text-black text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Cover Your Kittens!</h1>
        <button
          className="bg-[#b4e2d7] text-black py-2 px-4 rounded hover:bg-opacity-90 transition mb-4"
          onClick={handleCreateRoom}
        >
          Create New Game
        </button>
        <div className="mt-4">
          <input
            className="border border-gray-300 rounded px-4 py-2 text-black mb-4"
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
          />
          <button
            className="bg-[#ffb0c2] text-black py-2 px-4 rounded hover:bg-opacity-90 transition"
            onClick={handleJoinRoom}
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
  
    
  


}
