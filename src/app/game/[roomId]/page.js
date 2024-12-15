'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const RoomPage = () => {
  const router = useRouter();
  const [roomId, setRoomId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [userList, setUserList] = useState([]);
  const [socket, setSocket] = useState(null);
  const [cards, setCards] = useState([]);


  const getRandomCards = () => {
    // Generate 4 random numbers between 1 and 12 (corresponding to card1.png to card12.png)
    const randomCards = [];
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * 12) + 1; // Generates a random number between 1 and 12
      randomCards.push(`card${randomIndex}.png`);
    }
    return randomCards;
  };

  useEffect(() => {
    // Retrieve roomId and nickname from sessionStorage
    const storedRoomId = sessionStorage.getItem('roomId');
    const storedNickname = sessionStorage.getItem('nickname');
    const storedUserList = sessionStorage.getItem('userList');


    if (!storedRoomId || !storedNickname) {
      return router.push('/'); // Redirect to homepage if data is missing
    }

    setRoomId(storedRoomId);
    setNickname(storedNickname);

     // Set userList from sessionStorage or initialize as empty array
     setUserList(storedUserList ? JSON.parse(storedUserList) : []);

     setCards(getRandomCards());


    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    newSocket.emit('joinRoom', { roomId: storedRoomId, nickname: storedNickname });

    newSocket.on('userJoined', (data) => {
      setMessages((prev) => [...prev, `${data.nickname} joined the room!`]);
    });
    newSocket.on('updateUserList', (userList) => {
      setUserList(userList);
      sessionStorage.setItem('userList', JSON.stringify(userList)); // Store updated user list in sessionStorage
    });


    newSocket.on('error', (message) => {
      console.error(message);
    });

    return () => newSocket.disconnect();
  }, [router]);

  if (!roomId || !nickname) {
    return <p>Missing roomId or nickname!</p>;
  }

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <h2>Nickname: {nickname}</h2>
      <div>
      <h3>Players in this room:</h3>
      <ul className="list-disc pl-5">
        {userList.map((user, index) => (
          <li className="ml-2" key={index}>
            {user}
          </li>
        ))}
      </ul>
      </div>
      <h3>Random Cards:</h3>
      <div className="card-container">
        {cards.map((card, index) => (
          <div className="card" key={index}>
          <img
            key={index}
            src={`/cards/${card}`}
            alt={`Card ${index + 1}`}
            className="card-img"
            
          />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomPage;
