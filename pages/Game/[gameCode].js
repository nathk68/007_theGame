import logo from '../../public/007_logo.png';
import Cookie from 'js-cookie';
import cookies from 'next-cookies';
import React from 'react';
//import { useState, useEffect } from 'react';
import spyIcon from '../../public/spy-icon.png';
import gunIcon from '../../public/Gun.png';
import bulletIcon from '../../public/Bullet.png';
import shieldIcon from '../../public/Spy.png';
import '../../src/app/App.css';
import NavBar from '../../src/app/NavBar';
import Image from 'next/image';
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import io from 'socket.io-client';
import { db } from '../../utils/firebase';
import { ref, remove, push, set, update, child, onValue, runTransaction  } from 'firebase/database';

// Configurer Firebase si elle n'est pas déjà configurée

export async function getServerSideProps(context) {
  const allCookies = cookies(context);
  console.log(allCookies);
  return {
    props: {
      userID: allCookies.userId || "",
      username: allCookies.username || "",
      isHost: allCookies.isHost || false,
    },
  };
}

const Game = ({ userID, username, isHost }) => {
  const [ammo, setAmmo] = React.useState(0);
  const [botAmmo, setBotAmmo] = React.useState(0);
  const [round, setRound] = React.useState(1);
  const [playerAction, setPlayerAction] = React.useState('');
  const [botAction, setBotAction] = React.useState('');
  const [isReady, setIsReady] = React.useState(false);
  const [gameOver, setGameOver] = React.useState(false);
  const [result, setResult] = React.useState('');
  const [countdown, setCountdown] = React.useState(5);
  const [playerAmmoVisible, setPlayerAmmoVisible] = React.useState(false);
  const [botAmmoVisible, setBotAmmoVisible] = React.useState(false);
  //const [paramsReady, setParamsReady] = React.useState(false);
  const [gameCode, setGameCode] = React.useState('');
  const [everyoneReady, setEveryoneReady] = React.useState(false);
  const [searchParams] = useSearchParams();
  const [gameSession, setGameSession] = React.useState(null);
  const [playerNames, setPlayerNames] = React.useState([]);
  const [leaveGame, setLeaveGame] = React.useState('');
  const [playerCount, setPlayerCount] = React.useState(0);
  const [playerIds, setPlayerIds] = React.useState([]);
  //const [isHost, setIsHost] = React.useState(false);
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  // const code = params.gameCode

  const actions = ['Recharger', 'Tirer', 'Se protéger'];

  React.useEffect(() => {
      //const code = searchParams.get('gameCode');
      if(params !== null) {
        setGameCode(params.gameCode);
        //console.log("paramètres partie : ", params);
        if (params.gameCode) {
          const gameSessionRef = ref(db, `GameSessions/${params.gameCode}`);
          onValue(gameSessionRef, (snapshot) => {
            const data = snapshot.val();
            //console.log("Données de la partie : ", data);
            setGameSession(data);
            if (data.ShowUserAmmo) {
              setPlayerAmmoVisible(true);
            }
            if (data.ShowOthersAmmo) {
              setBotAmmoVisible(true);
            }
          });
        }
      }
  }, [params]);
  

  if (gameCode === null) {
    // Vous pouvez afficher un indicateur de chargement ou une mise en page temporaire ici
    return (
      <div className='h-screen bg-black'>
        <NavBar />
        <div className='flex justify-center items-center m-auto h-5/6'>
          <div className='text-white'>Chargement de la partie...</div>
        </div>
      </div>
    );
  }

  async function fetchGamePreferences(code) {
    const gameSettings = localStorage.getItem(code);
    const settings = gameSettings ? JSON.parse(gameSettings) : {};
    console.log(settings);
    return Promise.resolve({showPlayerAmmo: settings.showPlayerAmmo, showBotAmmo: settings.showBotAmmo});
  }; 

  React.useEffect(() => {
    const preferences = localStorage.getItem('gamePreferences');
    if (preferences) {

      // const { code, showPlayerAmmo, showBotAmmo } = router.query;
      // console.log('Code de la partie :', code);
            // const gameSettings = localStorage.getItem(code);
            const settings = preferences ? JSON.parse(preferences) : {};
            console.log(settings);
            // console.log('Code de la partie :', code);
            console.log('Afficher les munitions du joueur :', settings.showPlayerAmmo);
            console.log('Afficher les munitions du bot :', settings.showBotAmmo);
                  //fetchGamePreferences(code).then(({showPlayerAmmo, showBotAmmo}) => {
            setPlayerAmmoVisible(settings.showPlayerAmmo);
            setBotAmmoVisible(settings.showBotAmmo);
            //setParamsReady(true);
            //});

            // if (code) {
            //   const gameSettings = localStorage.getItem(code);
            //   const settings = gameSettings ? JSON.parse(gameSettings) : {};

            //   setPlayerAmmoVisible(settings.showPlayerAmmo || false);
            //   setBotAmmoVisible(settings.showBotAmmo || false);
            // }
          }
        }, []);

        // Effet pour gérer le compteur de 5 secondes
        
        

        // Fonction pour démarrer la prochaine manche
        const nextRound = () => {
          console.log("Changement de round")
          update(ref(db, `GameSessions/${gameCode}`), {
            allReady: false,
          });
          //setTimeout(1000);
          setEveryoneReady(false);
          console.log("Etat du everyoneReady : ", everyoneReady);
          
          //setRound((prevRound) => prevRound + 1);
          setPlayerAction('');
          setBotAction('');
          setIsReady(false);
          
          setCountdown(5);
          playerIds.forEach(async (playerId)=> {
            update(ref(db, `GameSessions/${gameCode}/players/${playerId}`), {
              action: '',
            });
          });
          setPlayerAction('');
          
          if (isHost) {
            update(ref(db, `GameSessions/${gameCode}`), {
              round: round+1,
            });
          }
        };

        // METTRE À JOUR LE STATUT DE PRÊT
        // React.useEffect(() => {
        //   const gameSessionRef = ref(db, `GameSessions/${gameCode}`);
        //   onValue(gameSessionRef, (snapshot) => {
        //     const data = snapshot.val();
        //     if (data && data.allReady) {
        //       setEveryoneReady(true);
        //     }
            
        //   });
        // }, [gameCode]);


        const handleLeave = () => {
          // Supprimer le joueur de la partie
          
          remove(ref(db, `GameSessions/${gameCode}/players/${userID}`));
          remove(ref(db, `Users/${userID}`));
          const NbPlayersRef = ref(db, `GameSessions/${gameCode}/NumberPlayers`);
          runTransaction(NbPlayersRef, (currentNumber) => {
            return (currentNumber || 0) - 1;
          });
          router.push('/');
        };

        const handleActionClick = (action) => {
          // if (action === 'Reload') {
          //   setAmmo((prevAmmo) => prevAmmo + 1);
          // }
          // if (action === 'Shoot' && ammo > 0) {
          //   setAmmo((prevAmmo) => prevAmmo - 1);
          // }
            setPlayerAction(action);
            setIsReady(false);
        };


        const handleReadyClick = () => {
          update(ref(db, `GameSessions/${gameCode}/players/${userID}`), {
            action: playerAction,
          });

          // Vérifier si tous les joueurs sont prêts et met à jour ALLREADY
          const gameSessionRef = ref(db, `GameSessions/${gameCode}`);
          onValue(gameSessionRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.players) {
              const playerIds = Object.keys(data.players);
              let numberOfPlayers = playerIds.length;
              let allPlayersReady = playerIds.every((id) => data.players[id].action);
              if (allPlayersReady) {
                update(ref(db, `GameSessions/${gameCode}`), {
                  allReady: true,
                });
                setEveryoneReady(true);
                console.log("Tous les joueurs sont prêts");
              }
            }
          }, [gameCode, everyoneReady]);

          let newResult = '';
          

          setResult(newResult);
          console.log(newResult);
          // setRound((prevRound) => prevRound + 1);

          setIsReady(true);
          
        };
        
        // METTRE EVERYONEREADY A TRUE SI TOUS LES JOUEURS SONT PRÊTS
        // React.useEffect(() => {
        //   const gameSessionRef = ref(db, `GameSessions/${gameCode}`);
        //   onValue(gameSessionRef, (snapshot) => {
        //     const data = snapshot.val();
        //     if (data && data.allReady) {
        //       setEveryoneReady(true);
        //     }
        //   });
        // }, [gameCode, everyoneReady]);

        // COMPTE A REBOURS NEXT ROUND
        // React.useEffect(() => {
        //   let timer;
        //   if (everyoneReady && countdown > 0) {
        //     timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        //   } else if (countdown === 0) {
        //     nextRound();
        //   }
        //   return () => clearTimeout(timer);
          
        // }, [everyoneReady, countdown]);

        // JOUEUR QUI QUITTE LA PARTIE
        React.useEffect(() => {
          const gameSessionRef = ref(db, `GameSessions/${gameCode}`);
          let initialLoad = true;
          let previousPlayerCount = 0;
          onValue(gameSessionRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.players) {
              const playerIds = Object.keys(data.players);
              let numberOfPlayers = playerIds.length;
              if (numberOfPlayers === 0) {
                // La partie est terminée si aucun joueur n'est présent
                remove(ref(db, `GameSessions/${gameCode}`));
              }

              if (initialLoad && numberOfPlayers < previousPlayerCount) {
                // Mettez ici la logique pour afficher votre notification
                setLeaveGame("Quelqu'un a quitté la partie !");
                if (leaveGame !== '') {
                  setTimeout(() => {
                    setLeaveGame('');
                  }, 4000);
                } // Exemple basique, remplacez par votre méthode de notification
              }
              previousPlayerCount = numberOfPlayers;
            }
          });
          initialLoad = false;
        }, [gameCode, leaveGame]);

        //let singleIteration = true;

        // METTRE ALLREADY A TRUE SI TOUS LES JOUEURS SONT PRÊTS
        React.useEffect(() => {
          const gameSessionRef = ref(db, `GameSessions/${gameCode}`);
          onValue(gameSessionRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.players) {
              const playerIds = Object.keys(data.players);
              let numberOfPlayers = playerIds.length;
              let allPlayersReady = playerIds.every((id) => data.players[id].action);
              if (allPlayersReady) {
                update(ref(db, `GameSessions/${gameCode}`), {
                  allReady: true,
                });
                console.log("Tous les joueurs sont prêts");
              }
            }
          }, [gameCode, countdown, everyoneReady]);
        }, [gameCode, playerCount, leaveGame, countdown, everyoneReady]);

        React.useEffect(() => {

          const usersRef = ref(db, 'Users');
          onValue(usersRef, (snapshot) => {
            const users = snapshot.val();
            const activePlayers = playerIds.map((id) => users[id]);
            try {
              const playerNamesRef = playerIds.map((id) => users[id].Username);
              //console.log("playerNames : ", playerNamesRef);
              setPlayerNames(playerNamesRef);
            } catch (error) {
              console.log("");
            }
            
          });
        }, [gameCode, playerIds]);
        
        // CHANGEMENT DE ROUND
        // React.useEffect(() => {
        //   if (everyoneReady && countdown === 0) {
        //     nextRound();
        //   }
        // }, [gameCode,everyoneReady]);

        // TIMER
        React.useEffect(() => {
          let timer;
          console.log("Compte à rebours : ", countdown)
          if (everyoneReady && countdown > 0) {
            //console.log("Compte à rebours dans le if : ", countdown)
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            //console.log("Compte à rebours après le setTimeout : ", countdown)
          } else if (countdown === 0) {
            setEveryoneReady(false);
            nextRound();
          }
          
          return () => clearTimeout(timer);
        }, [everyoneReady, countdown]);

          // const gameSessionRef2 = ref(db, `GameSessions/${gameCode}`);
          // let previousPlayerCount = 0;
          // onValue(gameSessionRef2, (snapshot2) => {
          //   const data = snapshot2.val();
          //   // Mettez à jour l'état du composant avec les nouvelles données
          //   if (initialLoad && data && data.players) {
          //     const playerIds = Object.keys(data.players);
          //     setPlayerIds(playerIds);
          //     let numberOfPlayers = playerIds.length;
          //     let allPlayersReady = playerIds.every((id) => data.players[id].action);

          //     let roundServer = data.round;
          //     setRound(roundServer);
              
          //     if (allPlayersReady) {
          //       update(ref(db, `GameSessions/${gameCode}`), {
          //         allReady: true,
          //       });
          //       console.log("Tous les joueurs sont prêts");
              
          //     }
          //     initialLoad = false;
          //   }
          // }, [gameCode]);
        

              // if (numberOfPlayers === 0) {
              //   // La partie est terminée si aucun joueur n'est présent
              //   remove(ref(db, `GameSessions/${gameCode}`));
              // }

              // if (!initialLoad && numberOfPlayers < previousPlayerCount) {
              //   // Mettez ici la logique pour afficher votre notification
              //   setLeaveGame("Quelqu'un a quitté la partie !");
              //   if (leaveGame !== '') {
              //     setTimeout(() => {
              //       setLeaveGame('');
              //     }, 4000);
              //   } // Exemple basique, remplacez par votre méthode de notification
              // }
              // previousPlayerCount = numberOfPlayers;

              
              
              // Transformez les IDs des joueurs en noms à partir de la table Users
              // et mettez à jour l'état correspondant pour refléter les joueurs actuels dans la partie
            //}
            // else {
            //   remove(ref(db, `GameSessions/${gameCode}`));
            // }
          //}, [gameCode, countdown, everyoneReady]);
          // initialLoad = false;
          // N'oubliez pas de nettoyer l'écouteur lors du démontage du composant
          //return () => off(gameSessionRef2);
        // }, [gameCode, playerCount, leaveGame, countdown, everyoneReady]);

        return (
          <div className="bg-black h-screen">
            <NavBar />
            <div style={{ height: '90dvh'}} className="">
              <div className='h-11 w-screen mt-10 flex'>
                <button onClick={() => handleLeave()} className="ml-5 text-white bg-red-700 rounded-md h-full w-36">Quitter la partie</button>
                {leaveGame && (<div className='w-full flex flex-col justify-center items-center'>
                  <h1 className="text-white w-2/6 h-5/6 justify-center text-center p-1 bg-red-700/40 rounded-md">{leaveGame}</h1>
                </div>  )}
                  
              </div>
              <div className='flex flex-col justify-center items-center text-white h-5/6'>
                <div className='absolute top-36 mt-8 text-center'>
                  {!gameOver && <h2 className="text-2xl mb-10">Manche : {round}</h2>}
                  {everyoneReady && !gameOver && (<h3 className="text-2xl mb-4">Prochaine manche dans {countdown}...</h3>)}
                </div>
                
                <div className='absolute left-0 ml-10 rounded-3xl top-1/2 -translate-y-1/2 border-1 bg-gray-900 h-1/6 w-60 items-center justify-center'>
                  { playerAmmoVisible && <h3 className="text-lg text-white mb-4 mt-14 ml-10">Vos munitions : {ammo}</h3>}
                  { botAmmoVisible && <h3 className="text-lg text-white mb-4 ml-10">Munitions ennemies : {botAmmo}</h3>}
                </div>

                <div className="relative text-center border-1 rounded-2xl shadow-2xl shadow-purple-700 border-purple-700 h-4/6 w-3/6">
                  <div className='flex justify-around items-center space-x-4 h-4/6'>
                    <div>
                      <Image src={spyIcon} alt="Player 1" width={100} height={100} className="mx-auto bg-purple-300 p-2 rounded-full"/>
                      {playerNames[0] == username && <div className="mt-2 text-purple-500">{playerNames[0]}</div>}
                      {playerNames[0] != username && <div className="mt-2 text-white">{playerNames[0]}</div>}
                    </div>
                    {playerNames.length > 1 && (
                      <div><Image src={spyIcon} alt="Player 2" width={100} height={100} className="mx-auto bg-purple-300 p-2 rounded-full"/>
                        {playerNames[1] == username && <div className="mt-2 text-purple-500">{playerNames[1]}</div>}
                        {playerNames[1] != username && <div className="mt-2">{playerNames[1]}</div>}
                      </div>
                    )}
                    
                  </div>
                  <div className='flex justify-center space-x-20 h-20 mb-5'>
                    {actions.map((action) => (
                      <button
                        key={action}
                        onClick={() => handleActionClick(action)}
                        disabled={isReady || (action === 'Tirer' && ammo <= 0) || gameOver}
                        className={`p-4 text-white h-16 rounded-lg ${playerAction === action && 'bg-red-950 hover:bg-red-900'}
                          ${action === 'Tirer' && ammo <= 0 ? 'bg-gray-500' : 'bg-purple-900/50'}
                          ${isReady || gameOver ? 'cursor-not-allowed' : 'hover:bg-purple-950'}`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='absolute bottom-0 mb-16'>
                  {!gameOver && (
                    <button
                    onClick={handleReadyClick}
                    disabled={isReady || !playerAction || gameOver}
                    className={`w-32 h-10 mt-4 ${isReady ? 'bg-purple-500 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-950'} 
                      text-white font-bold py-2 px-4 rounded`}
                    >
                      Prêt
                    </button>
                  )}
                  
                </div>

                <div className="absolute right-10 mt-4 text-white rounded-3xl top-1/2 -translate-y-1/2 border-1 bg-gray-900 h-1/6 w-60 items-center justify-center">      
                  <h2 className='text-center text-3xl mb-8'>Résultats</h2>
                  {isReady && (
                    <div className='text-center'>
                      <p>Votre action : {playerAction}</p>
                      <p>Action ennemie : {botAction}</p>
                      <p>{result}</p>
                    </div>
                  )}
                </div>

                {gameOver && (
                  
                    <div className="game-over mb-4">
                      <p className="text-3xl mt-8">Partie terminée !</p>
                      <button
                        onClick={() => {
                          // Reset game state to start over
                          setRound(1);
                          setAmmo(0);
                          setPlayerAction('');
                          setBotAction('');
                          setIsReady(false);
                          setGameOver(false);
                          setResult('');
                        }}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Redémarrer la partie
                      </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        );
      }
    
export default Game;
