import logo from '../public/007_logo.png';
import Cookie from 'js-cookie';
import React from 'react';
import axios from 'axios';
import '../src/app/App.css';
import Link from 'next/link';
import NavBar from '../src/app/NavBar';
import { db } from '../utils/firebase';
import { useRouter } from 'next/navigation';
import { ref, push, set, update, runTransaction, child } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export default function Play() {
  // const [players, setPlayers] = React.useState(['Player 1', 'Player 2', 'Player 3']);
  const [invitationCode, setInvitationCode] = React.useState('');
  const [showPlayerAmmo, setPlayerAmmo] = React.useState(false);
  const [showBotAmmo, setBotAmmo] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [gameCode, setGameCode] = React.useState('');
  const router = useRouter();

  const createGame = async () => {
    // Créer une nouvelle session de jeu dans Firebase Realtime Database
    const newGameRef = push(ref(db, 'GameSessions'));
    const newGameCode = newGameRef.key; // Le nouveau code de la partie
    const userId = uuidv4(); // Générer un GUID pour l'utilisateur

    // Créer un nouvel utilisateur dans la table 'users'
    await set(ref(db, `Users/${userId}`), {
      ID_user: userId,
      Username: username,
    });

    await set(newGameRef, {
      ID_session: newGameCode,
      ShowUserAmmo: showPlayerAmmo,
      ShowOthersAmmo: showBotAmmo,
      NumberPlayers: 1,
      players: {
        [userId]: {
          ID_user: userId,
          username: username,
          ammo: 10,
          action: ''
        },
      },
      round: 1,
      allReady: false,
    });
    Cookie.set('userId', userId);
    Cookie.set('username', username);
    Cookie.set('isHost', true);
    // Rediriger l'utilisateur vers la page de jeu avec le nouveau gameCode
    router.push(`/Game/${newGameCode}`); // ?username=${encodeURIComponent(username)}
  };

  const joinGame = async () => {
    const userId = uuidv4();
    const gameRef = ref(db, `GameSessions/${gameCode}`);
    const userRef = ref(db, `Users/${userId}`);

    // Ajouter un nouvel utilisateur dans la table 'users'
    await set(userRef, {
      ID_user: userId,
      Username: username,
    });

    // Mettre à jour le jeu pour inclure le nouveau joueur
    const gameSessionPlayers = ref(db, `GameSessions/${gameCode}/NumberPlayers`)
    await runTransaction(gameSessionPlayers, (currentNumber) => {
      return (currentNumber || 0) + 1;
    });

    await update(ref(db, `GameSessions/${gameCode}/players`), {
      [userId]: {
        ID_user: userId,
        username: username,
        ammo: 10,
        action: ''
      },
    });
    Cookie.set('userId', userId);
    Cookie.set('username', username);
    Cookie.set('isHost', false);
    //document.cookie = `currentUserID=${userId};currentUserName=${username};gameCode=${gameCode}`;
    //localStorage.setItem('currentUserName', username);
    // Incrémenter NumberPlayers dans GameSessions
    // Note: pour une mise à jour atomique, envisagez d'utiliser une transaction Firebase

    router.push(`/Game/${gameCode}`); // ?username=${encodeURIComponent(username)}
  };






  // Fonction pour générer un code d'invitation aléatoire
  const generateInvitationCode = () => {
    // Génère un code d'invitation aléatoire.
    // C'est un exemple simple et vous devriez utiliser une meilleure méthode de génération pour la production.
    const code = (Math.random() + 1).toString(36).substring(2, 8).toUpperCase();
    setInvitationCode(code);

    const gameSettings = {
      showPlayerAmmo,
      showBotAmmo,
    };

    localStorage.setItem('gamePreferences', JSON.stringify(gameSettings));
    console.log(localStorage.getItem('gamePreferences'));
  };

  return (
    <div className="bg-black h-screen">
      <NavBar />
      <div className='flex justify-center items-center'>
        <div className="flex flex-col items-center justify-center text-white p-4">
            <label className="text-xl">Nom d'utilisateur : </label>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              className="mt-2 mb-4 px-3 py-2 text-gray-700 bg-white border rounded shadow focus:outline-none focus:shadow-outline"
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="flex flex-col justify-center items-center bg-slate-900 rounded-xl w-4/6">
              <h1 className="text-4xl font-bold mb-5">Créer une partie</h1>
              <div className='flex flex-col justify-center'>
                <label className='mb-5 text-xl flex items-center space-x-2 w-full'>
                  <input className='w-8 h-8 mr-5' type='checkbox' checked={showPlayerAmmo} onChange={() => setPlayerAmmo(!showPlayerAmmo)} />
                  Afficher les munitions du joueur
                </label>
                <label className='mb-5 text-xl flex items-center space-x-2 w-full'>
                  <input className='w-8 h-8 mr-5' type='checkbox' checked={showBotAmmo} onChange={() => setBotAmmo(!showBotAmmo)} />
                  Afficher les munitions de l'ennemi
                </label>
              </div>
            
              <p className="mb-4 text-lg text-center mt-4">Générez un code d'invitation et partagez-le avec vos amis pour démarrer une partie ensemble.</p>
              {invitationCode && <div className="text-lg font-medium bg-gray-700 p-3 rounded mb-5">Code d'invitation: {invitationCode}</div>}
              {!invitationCode && <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 transition duration-300"
                onClick={generateInvitationCode}
              >
                Générer un code
              </button>}

              {invitationCode && (
                // <Link href={`/Game?code=${invitationCode}`} passHref>
                  <button
                    onClick={createGame}
                    disabled={!invitationCode}
                    className={`${
                      invitationCode ? 'bg-green-500 hover:bg-green-700' : 'bg-green-200'
                    } text-white font-bold py-2 px-4 rounded mb-4`}
                  >
                    Créer la partie
                  </button>
                // </Link>
              )}
            </div>

          <div className="flex flex-col justify-center items-center bg-slate-900 rounded-xl w-4/6 mt-5 h-60">
            <h1 className="text-4xl font-bold mb-5">Rejoindre une partie</h1>
            <input
              type="text"
              placeholder="Code de la partie à rejoindre"
              // value={invitationCode}
              className=" mb-5 mt-2 w-60 px-3 py-2 text-gray-700 bg-white border rounded shadow focus:outline-none focus:shadow-outline"
              onChange={(e) => setGameCode(e.target.value)}
            />
            <button className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded' onClick={joinGame}>Rejoindre une partie</button>
          </div>
          
        </div>
      </div>
    </div>
  );
}