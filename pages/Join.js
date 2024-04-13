import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Join() {
  const [username, setUsername] = useState('');
  const [gameCode, setGameCode] = useState('');
  const router = useRouter();

  const joinGame = () => {
    router.push(`/Game/${gameCode}?username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="bg-black h-screen">
        <NavBar />
        <div className="joinGame text-white">
        <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <input
            type="text"
            placeholder="Code de la partie"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
        />
        <button onClick={joinGame}>Rejoindre la partie</button>
        </div>
    </div>
  );
}