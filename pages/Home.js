import logo from '../public/007_logo.png';
import React from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import { Button, TextField, List, ListItem, ListItemText } from '@mui/material';
import '../src/app/App.css';
// import Game from './Game';
// import Play from './Play';
import Link from 'next/link';
import Image from 'next/image';

export default function Home () {
  return (
    <div>
      <div className="bg-black flex justify-center align-items-center mb-10 mt-52">
          <section >
            <div className="rounded shadow-effect shadow-neon-ellipse">
              <Image src={logo} alt="Logo" className='h-60 w-60'/>
            </div>
          </section>
          
        </div>
        <div className='justify-center'>
            <h1 className="text-white text-7xl font-bold" stylename="font-family: 'Roboto', sans-serif;">Rechargez. Protégez. Tirez.</h1>
            {/* <button className="text-white h-14 w-40 mt-28 font-semibold py-2 px-4 border border-white rounded hover:bg-white hover:text-black transition-colors duration-300" component={Link} to="/Play">
              Jouer
            </button> */}
            {/* <div className="text-white h-14 w-40 mt-28 font-semibold py-2 px-4 border border-white rounded hover:bg-white hover:text-black transition-colors duration-300">
                
            </div> */}
            <div className=' mt-32'>
              <Link className="text-white h-14 w-40 font-semibold py-2 px-4 border border-white rounded hover:bg-white hover:text-black transition-colors duration-300" href="/Play" >
                    Jouer
              </Link>
            </div>
            
        </div>
    </div>
  );
}

// class Home extends React.Component {
//     constructor(props) {
//       super(props);
//     }
  
//     render() {
//       return (
//         <div>
//           <div className="bg-black flex justify-center align-items-center mb-10 mt-52">
//               <section >
//                 <div className="rounded shadow-neon-ellipse">
//                   <img src={logo} alt="Logo" className='h-60'/>
//                 </div>
//               </section>
              
//             </div>
//             <div className='justify-center'>
//                 <h1 className="text-white text-7xl font-bold" stylename="font-family: 'Roboto', sans-serif;">Rechargez. Protégez. Tirez.</h1>
//                 {/* <button className="text-white h-14 w-40 mt-28 font-semibold py-2 px-4 border border-white rounded hover:bg-white hover:text-black transition-colors duration-300" component={Link} to="/Play">
//                   Jouer
//                 </button> */}
//                 {/* <div className="text-white h-14 w-40 mt-28 font-semibold py-2 px-4 border border-white rounded hover:bg-white hover:text-black transition-colors duration-300">
                    
//                 </div> */}
//                 <div className=' mt-32'>
//                   <Link className="text-white h-14 w-40 font-semibold py-2 px-4 border border-white rounded hover:bg-white hover:text-black transition-colors duration-300" to="/Play" >
//                         Jouer
//                   </Link>
//                 </div>
                
//             </div>
//         </div>
//       );
//     }
//   }

//  export default Home;