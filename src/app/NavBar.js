import logo from './007_logo.png';
import React from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import { Button, TextField, List, ListItem, ListItemText } from '@mui/material';
import './App.css';
// import Game from './Game';
// import Play from './Play';
import Link from 'next/link';
import Image from 'next/image';
//import Link from 'react';

export default function NavBar ({ windowHome }) {
  return (
    <div>
      <nav style={{ height: '10dvh'}} className="flex items-center justify-between p-4 bg-transparent">
            <div className="logo">
              <Image src={logo} alt="Logo" className="h-20 w-20" onClick={windowHome}/>
            </div>
            <ul className="flex items-center space-x-8 mr-20">
              <li>
                <Link className="text-white text-xl uppercase hover:text-gray-300" href="/">Accueil</Link>
                {/* <button className="text-white text-xl uppercase hover:text-gray-300" component={Link} to="/">
                  Accueil
                </button>   */}
              </li>
              <li>
                <Link className="text-white text-xl uppercase hover:text-gray-300" href="/Play">Jouer</Link>
                
              </li>
              <li><a href="#" className="text-white text-xl uppercase hover:text-gray-300">Règles</a></li>
              <li><a href="#" className="text-white text-xl uppercase hover:text-gray-300">Contact</a></li>
            </ul>
          </nav>
    </div>
  );
}

// class NavBar extends React.Component {
//     constructor(props) {
//       super(props);
//       this.state = {
//         windowHome: 'Home'
//       };
//       }
    
  
//     render() {
//       return (
//         <div>
//           <nav className="flex items-center justify-between p-4 bg-transparent">
//             <div className="logo">
//               <img src={logo} alt="Logo" className="h-20" onClick={this.props.windowHome}/>
//             </div>
//             <ul className="flex items-center space-x-8 mr-20">
//               <li>
//                 <Link className="text-white text-xl uppercase hover:text-gray-300" to="/">Accueil</Link>
//                 {/* <button className="text-white text-xl uppercase hover:text-gray-300" component={Link} to="/">
//                   Accueil
//                 </button>   */}
//               </li>
//               <li>
//                 <Link className="text-white text-xl uppercase hover:text-gray-300" to="/Play">Jouer</Link>
                
//               </li>
//               <li><a href="#" className="text-white text-xl uppercase hover:text-gray-300">Règles</a></li>
//               <li><a href="#" className="text-white text-xl uppercase hover:text-gray-300">Contact</a></li>
//             </ul>
//           </nav>
//         </div>
//       );
//     }
//   }