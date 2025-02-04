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
  const [drawPile, setDrawPile] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [stack, setStack] = useState([]);
  const [turn, setTurn] = useState('player'); // Tracks whose turn it is: 'player' or 'computer'
  const [computerCards, setComputerCards] = useState([]);
  const [isChallenged, setIsChallenged] = useState(false); // Track if challenge is ongoing

  const getRandomCards = (count) => {
    const randomCards = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * 12) + 1;
      randomCards.push(`card${randomIndex}.png`);
    }
    return randomCards;
  };

  const initializeGame = () => {
    setDrawPile(getRandomCards(50));
    setCards(getRandomCards(4));
    setComputerCards(getRandomCards(4));
    setDiscardPile([`card${Math.floor(Math.random() * 12) + 1}.png`]);
  };

  const handleDrawCard = () => {
    if (drawPile.length === 0) return alert('The draw pile is empty!');
    if (cards.length >= 4) return alert('You can only have 4 cards at a time.');

    const newCard = drawPile.pop();
    setDrawPile([...drawPile]);
    setCards([...cards, newCard]);
  };

  const handleComputerTurn = () => {
    // Computer takes its turn
    if (turn !== 'computer') return; // Don't allow the computer to play when it's not its turn
  
    if (stack.length === 1) {
      // Computer withdraws one card if there's already one card in the stack
      const newCard = computerCards.pop();
      setComputerCards([...computerCards, newCard]);
      handleDrawCard(); // Let the computer draw a card
      setTurn('player'); // End computer's turn and pass it to the player
    } else {
      // Computer creates a stack of two cards
      const [firstCard, secondCard] = computerCards.splice(0, 2);
      setStack([firstCard, secondCard]);
      setComputerCards(computerCards); // Update the computer's hand after playing two cards
      setTurn('player'); // End computer's turn and pass it to the player
    }
  };
  
  useEffect(() => {
    // If it's the computer's turn, handle the computer's move
    if (turn === 'computer') {
      handleComputerTurn();
    }
  }, [turn]);

  const handleDropOnStack = (card, index) => {
    if (turn !== 'player') return; // Don't allow the player to play when it's not their turn
  
    // Check if the card is a wild card and prevent stacking two wild cards
    if (isWildCard(card) && stack.some(isWildCard)) {
      alert('You cannot stack two wild cards!');
      return;
    }
  
    const newStack = [...stack, card];
    setStack(newStack);
    setCards(cards.filter((_, i) => i !== index));
  
    if (newStack.length === 2) {
      const [firstCard, secondCard] = newStack;
  
      if (firstCard === secondCard || isWildCard(firstCard) || isWildCard(secondCard)) {
        // Apply animation and merge cards
        document.querySelector('.center-stack').classList.add('merging');
        setTimeout(() => {
          setStack([firstCard]); // Replace with one card
          document.querySelector('.center-stack').classList.remove('merging');
        }, 500); // Match the animation duration
      } else {
        // Return cards to the hand if they don't match
        setCards((prevCards) => [...prevCards, ...newStack]);
        setStack([]); // Clear the center stack
        alert('Cards must match or at least one must be wild!');
      }
    }
  
    // End the player's turn and pass it to the computer
    setTurn('computer');
  };
  
  const handleDropOnDrawPile = (card, index) => {
    setCards(cards.filter((_, i) => i !== index));
    setDrawPile([...drawPile, card]);
  };

  const handleDropOnDiscardPile = (card, index) => {
    setDiscardPile([card, ...discardPile]); // Add card to the top of the discard pile
    setCards((prevCards) => prevCards.filter((_, i) => i !== index)); // Remove the card from the player's hand
  };

  const isWildCard = (card) => card === 'card2.png' || card === 'card5.png';

  // Challenge logic: If the top stack of the user is a card the computer has, it can challenge.
  const handleChallenge = () => {
    const userTopCard = stack[stack.length - 1];
    const computerCard = computerCards.find((card) => card === userTopCard);
    if (computerCard) {
      setIsChallenged(true); // Start the challenge
    }
  };

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

    initializeGame();

    return () => newSocket.disconnect();
  }, [router]);

  useEffect(() => {
    // If it's the computer's turn, handle the computer's move
    if (turn === 'computer') {
      handleComputerTurn();
    }
  }, [turn]);

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

      <div className="game-container flex justify-between items-center">
        {/* Draw Pile */}
        <div className="pile draw-pile w-[170px] h-[250px] rounded-[15px]" onClick={handleDrawCard}>
          <p>Draw Pile: {drawPile.length} cards</p>
          <img src="/cards/back.png" alt="Draw Pile" className="w-full h-auto rounded-[15px]" />
        </div>

        {/* Center Stack */}
        <div
          className="center-stack w-[170px] h-[250px] rounded-[15px]"
          onDragOver={(e) => e.preventDefault()} // Allow drag over
          onDrop={(e) => {
            e.preventDefault();
            const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'), 10);
            if (!isNaN(cardIndex)) {
              handleDropOnStack(cards[cardIndex], cardIndex);
            }
          }}
        >
          <h3>Center Stack</h3>
          <div className="flex flex-wrap">
            {stack.map((stackCard, idx) => (
              <div key={idx} className="card w-[120px] h-[180px] rounded-[10px]">
                <img src={`/cards/${stackCard}`} alt={`Stack Card ${idx + 1}`} className="w-full h-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Player's Cards */}
        <div className="card-container flex">
          {cards.map((card, index) => (
            <div
              key={index}
              className="card w-[120px] h-[180px] rounded-[10px] cursor-pointer"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('cardIndex', index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropOnDrawPile(card, index)}
            >
              <img src={`/cards/${card}`} alt={`Card ${index + 1}`} className="w-full h-full" />
            </div>
          ))}
        </div>

        {/* Discard Pile */}
        <div
          className="pile discard-pile w-[170px] h-[250px] rounded-[15px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'), 10);
            if (!isNaN(cardIndex)) {
              handleDropOnDiscardPile(cards[cardIndex], cardIndex);
            }
          }}
        >
          <p>Top Card: {discardPile[0]}</p>
          <img src={`/cards/${discardPile[0]}`} alt="Discard Pile" className="w-full h-auto rounded-[15px]" />
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
