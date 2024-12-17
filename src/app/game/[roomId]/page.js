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
  const [drawPile, setDrawPile] = useState([]); // Cards in the draw pile
  const [discardPile, setDiscardPile] = useState([]); // Top card of the discard pile

  const getRandomCards = (count) => {
    const randomCards = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * 12) + 1;
      randomCards.push(`card${randomIndex}.png`);
    }
    return randomCards;
  };

  const initializeGame = () => {
    // Initialize the draw pile with 50 random cards
    setDrawPile(getRandomCards(50));
    // Give the user 4 random cards
    setCards(getRandomCards(4));
    // Initialize the discard pile with one random card
    setDiscardPile([`card${Math.floor(Math.random() * 12) + 1}.png`]);
  };

  const handleDrawCard = () => {
    if (drawPile.length === 0) return alert('The draw pile is empty!');
    if (cards.length >= 4) return alert('You can only have 4 cards at a time.');

    // Draw a card from the draw pile
    const newCard = drawPile.pop();
    setDrawPile([...drawPile]); // Update the draw pile
    setCards([...cards, newCard]); // Add the new card to the user's hand
  };

  const handleDiscardCard = (index) => {
    const discardedCard = cards[index];
    setCards(cards.filter((_, i) => i !== index)); // Remove the discarded card from hand
    setDiscardPile([discardedCard]); // Update the discard pile with the new top card

    // Ensure user has 4 cards by drawing a new one (if possible)
    if (drawPile.length > 0) {
      const newCard = drawPile.pop();
      setDrawPile([...drawPile]);
      setCards([...cards, newCard]);
    }
  };

  const isWildCard = (card) => card === 'card2.png' || card === 'card5.png';

  useEffect(() => {
    const storedRoomId = sessionStorage.getItem('roomId');
    const storedNickname = sessionStorage.getItem('nickname');
    const storedUserList = sessionStorage.getItem('userList');

    if (!storedRoomId || !storedNickname) {
      return router.push('/');
    }

    setRoomId(storedRoomId);
    setNickname(storedNickname);
    setUserList(storedUserList ? JSON.parse(storedUserList) : []);

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    newSocket.emit('joinRoom', { roomId: storedRoomId, nickname: storedNickname });
    newSocket.on('updateUserList', (userList) => {
      setUserList(userList);
      sessionStorage.setItem('userList', JSON.stringify(userList));
    });
    newSocket.on('error', console.error);
    setSocket(newSocket);

    initializeGame(); // Initialize the game setup

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

      <div className="game-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Draw Pile */}
        <div className="pile draw-pile" onClick={handleDrawCard}>
          <div className="pile-top">
            <img src="/cards/back.png" alt="Draw Pile" className="pile-img" />
          </div>
          <p>Draw Pile: {drawPile.length} cards</p>
        </div>

        {/* Player's Cards */}
        <div className="card-container">
          {cards.map((card, index) => (
            <div className="card" key={index} onClick={() => handleDiscardCard(index)}>
              <img src={`/cards/${card}`} alt={`Card ${index + 1}`} className="card-img" />
            </div>
          ))}
        </div>

        {/* Discard Pile */}
        <div className="pile discard-pile">
          {discardPile.length > 0 && (
            <div className="pile-top">
              <img src={`/cards/${discardPile[0]}`} alt="Discard Pile" className="pile-img" />
            </div>
          )}
          <p>Top Card: {discardPile[0]}</p>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
